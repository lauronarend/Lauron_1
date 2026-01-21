from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import httpx
from youtube_transcript_api import YouTubeTranscriptApi
from openai import OpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)

# YouTube API
YOUTUBE_API_KEY = os.environ.get('YOUTUBE_API_KEY', 'AIzaSyDummyKeyForDevelopment')
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

# OpenAI for intelligent filtering
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', 'sk-emergent-3Aa6d29C6Ab8395C02')
openai_client = OpenAI(api_key=OPENAI_API_KEY, base_url="https://api.emergentagi.com/v1")

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    created_at: datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SessionData(BaseModel):
    user_id: str
    session_token: str

class VideoResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    video_id: str
    title: str
    description: str
    thumbnail_url: str
    channel_title: str
    published_at: str

class SearchRequest(BaseModel):
    query: str
    player: Optional[str] = None
    team: Optional[str] = None
    goal_type: Optional[str] = None
    year: Optional[str] = None
    championship: Optional[str] = None
    historic_goal: bool = False
    beautiful_goal: bool = False
    ex_goal: bool = False
    own_goal: bool = False
    only_this_player: bool = False
    max_results: int = 20


# Create admin user on startup
@app.on_event("startup")
async def create_admin_user():
    admin_email = "admin@goltube.com"
    admin_password = "Admin@GolTube2025"
    
    # Check if admin exists
    admin_user = await db.users.find_one({"email": admin_email})
    if not admin_user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        hashed_pwd = hash_password(admin_password)
        
        admin_doc = {
            "user_id": user_id,
            "email": admin_email,
            "name": "Administrador",
            "password": hashed_pwd,
            "picture": None,
            "is_admin": True,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.users.insert_one(admin_doc)
        logger.info(f"Admin user created: {admin_email} / {admin_password}")
        
        # Set admin WhatsApp number
        await db.user_profiles.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "whatsapp_number": "5511941863112",
                "updated_at": datetime.now(timezone.utc)
            }},
            upsert=True
        )
        logger.info(f"Admin WhatsApp set to: 5511941863112")

    own_goal: bool = False
    only_this_player: bool = False
    max_results: int = 20


async def get_video_transcript(video_id: str) -> str:
    """Get video transcript/captions"""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        transcript = transcript_list.find_transcript(['pt', 'en', 'es'])
        transcript_data = transcript.fetch()
        transcript_text = " ".join([item['text'] for item in transcript_data[:50]])  # First 50 lines
        return transcript_text[:2000]  # Limit to 2000 chars
    except Exception as e:
        logger.warning(f"Could not get transcript for {video_id}: {e}")
        return ""

async def analyze_video_with_ai(video_data: dict, search_criteria: dict) -> dict:
    """Use AI to analyze if video matches search criteria"""
    try:
        # Get transcript
        transcript = await get_video_transcript(video_data['video_id'])
        
        # Build analysis prompt
        criteria_text = []
        if search_criteria.get('player'):
            criteria_text.append(f"Jogador: {search_criteria['player']}")
        if search_criteria.get('team'):
            criteria_text.append(f"Time: {search_criteria['team']}")
        if search_criteria.get('goal_type'):
            criteria_text.append(f"Tipo de gol: {search_criteria['goal_type']}")
        if search_criteria.get('year'):
            criteria_text.append(f"Ano: {search_criteria['year']}")
        if search_criteria.get('championship'):
            criteria_text.append(f"Campeonato: {search_criteria['championship']}")
        
        flags = []
        if search_criteria.get('historic_goal'):
            flags.append("gol histórico/lendário")
        if search_criteria.get('beautiful_goal'):
            flags.append("gol bonito/espetacular")
        if search_criteria.get('ex_goal'):
            flags.append("gol contra ex-time")
        if search_criteria.get('own_goal'):
            flags.append("gol contra")
        if search_criteria.get('only_this_player'):
            flags.append(f"vídeo exclusivamente sobre {search_criteria.get('player')}")
        
        if flags:
            criteria_text.append(f"Características especiais: {', '.join(flags)}")
        
        prompt = f"""Analise se este vídeo do YouTube corresponde aos critérios de busca.

Título: {video_data['title']}
Descrição: {video_data['description'][:500]}
Canal: {video_data['channel_title']}
Transcrição: {transcript[:1000] if transcript else 'Não disponível'}

Critérios de busca:
{chr(10).join(criteria_text)}

Responda APENAS com um JSON no formato:
{{"relevance_score": 0-100, "matches": true/false, "reason": "breve explicação"}}

Score 80+ = corresponde perfeitamente
Score 50-79 = corresponde parcialmente
Score 0-49 = não corresponde"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Você é um especialista em futebol que analisa vídeos de gols."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=150
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {"relevance_score": 50, "matches": True, "reason": "Análise AI falhou, mantendo vídeo"}


class SearchHistoryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    history_id: str
    user_id: str
    query: str
    filters: dict
    results_count: int
    created_at: datetime

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current user from session token (cookie or header)"""
    token = None
    
    # Try cookie first
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token and credentials:
        token = credentials.credentials
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a session token (Emergent Auth)
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    
    # Try JWT token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_youtube_service():
    return build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=YOUTUBE_API_KEY, cache_discovery=False)

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pwd = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_pwd,
        "picture": None,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    # Create JWT token
    access_token = create_access_token({"sub": user_id})
    
    user_response = User(**{k: v for k, v in user_doc.items() if k != "password"})
    
    return {"user": user_response, "access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": user["user_id"]})
    
    user_doc = {k: v for k, v in user.items() if k not in ["_id", "password"]}
    user_response = User(**user_doc)
    
    return {"user": user_response, "access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process Emergent Auth session_id and create session"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # Call Emergent backend to get user data
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            session_data = resp.json()
        except Exception as e:
            logger.error(f"Error fetching session data: {e}")
            raise HTTPException(status_code=500, detail="Failed to validate session")
    
    email = session_data["email"]
    name = session_data["name"]
    picture = session_data.get("picture")
    emergent_session_token = session_data["session_token"]
    
    # Check if user exists
    user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user:
        user_id = user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": emergent_session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=emergent_session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
    return User(**user)

@api_router.get("/whatsapp")
async def get_admin_whatsapp():
    """Get admin WhatsApp number (public route)"""
    admin = await db.users.find_one({"is_admin": True})
    if not admin:
        return {"whatsapp_number": "5511941863112"}
    
    profile = await db.user_profiles.find_one({"user_id": admin["user_id"]}, {"_id": 0})
    if profile and profile.get("whatsapp_number"):
        return {"whatsapp_number": profile["whatsapp_number"]}
    
    return {"whatsapp_number": "5511941863112"}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_user)):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

# Goals/Videos endpoints
@api_router.post("/goals/search", response_model=List[VideoResult])
async def search_goals(
    search_req: SearchRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Search for goal videos on YouTube"""
    youtube = get_youtube_service()
    
    # Build search query
    query_parts = ["gol", "goal", "futebol", "football", "soccer"]
    if search_req.query:
        query_parts.append(search_req.query)
    if search_req.player:
        query_parts.append(search_req.player)
    if search_req.team:
        query_parts.append(search_req.team)
    if search_req.goal_type:
        goal_type_map = {
            "bicicleta": "bicycle kick",
            "cabeça": "header goal",
            "fora da área": "long range goal",
            "pé-esquerdo": "left foot goal",
            "pé-direito": "right foot goal"
        }
        query_parts.append(goal_type_map.get(search_req.goal_type, search_req.goal_type))
    
    if search_req.year:
        query_parts.append(search_req.year)
    
    if search_req.championship:
        championship_map = {
            "copa do mundo": "world cup",
            "campeonato nacional": "national league",
            "libertadores": "copa libertadores",
            "mundial de clubes": "club world cup",
            "campeonato regional/estadual": "regional championship",
            "copa continental": "continental cup"
        }
        query_parts.append(championship_map.get(search_req.championship, search_req.championship))
    
    # Add flags
    if search_req.historic_goal:
        query_parts.append("historic legendary iconic")
    if search_req.beautiful_goal:
        query_parts.append("beautiful best amazing incredible")
    if search_req.ex_goal:
        query_parts.append("ex player return against former")
    if search_req.own_goal:
        query_parts.append("own goal")
    if search_req.only_this_player and search_req.player:
        query_parts.append(f"{search_req.player} solo individual")
    
    search_query = " ".join(query_parts)
    
    try:
        # Buscar mais vídeos para depois filtrar com IA
        request = youtube.search().list(
            part="snippet",
            q=search_query,
            type="video",
            maxResults=min(search_req.max_results * 2, 50),  # Busca 2x mais para filtrar
            order="relevance",
            videoCategoryId="17"  # Sports category
        )
        response = request.execute()
        
        # Preparar critérios para análise IA
        search_criteria = {
            "player": search_req.player,
            "team": search_req.team,
            "goal_type": search_req.goal_type,
            "year": search_req.year,
            "championship": search_req.championship,
            "historic_goal": search_req.historic_goal,
            "beautiful_goal": search_req.beautiful_goal,
            "ex_goal": search_req.ex_goal,
            "own_goal": search_req.own_goal,
            "only_this_player": search_req.only_this_player
        }
        
        # Verificar se há critérios específicos que requerem análise IA
        needs_ai_filtering = any([
            search_req.player,
            search_req.team,
            search_req.goal_type,
            search_req.year,
            search_req.championship,
            search_req.historic_goal,
            search_req.beautiful_goal,
            search_req.ex_goal,
            search_req.own_goal,
            search_req.only_this_player
        ])
        
        all_videos = []
        for item in response.get("items", []):
            video = VideoResult(
                video_id=item["id"]["videoId"],
                title=item["snippet"]["title"],
                description=item["snippet"]["description"],
                thumbnail_url=item["snippet"]["thumbnails"]["high"]["url"],
                channel_title=item["snippet"]["channelTitle"],
                published_at=item["snippet"]["publishedAt"]
            )
            all_videos.append(video)
        
        # Aplicar filtro inteligente com IA se necessário
        results = []
        if needs_ai_filtering and all_videos:
            logger.info(f"Aplicando análise IA para {len(all_videos)} vídeos...")
            
            # Analisar os primeiros vídeos com IA (limite para não gastar muito)
            for video in all_videos[:30]:
                video_data = {
                    "video_id": video.video_id,
                    "title": video.title,
                    "description": video.description,
                    "channel_title": video.channel_title
                }
                
                analysis = await analyze_video_with_ai(video_data, search_criteria)
                
                # Aceitar vídeos com score >= 60
                if analysis.get("relevance_score", 0) >= 60:
                    results.append(video)
                    logger.info(f"✓ Vídeo aceito: {video.title[:50]}... (score: {analysis['relevance_score']})")
                else:
                    logger.info(f"✗ Vídeo rejeitado: {video.title[:50]}... (score: {analysis['relevance_score']})")
                
                # Parar quando tiver resultados suficientes
                if len(results) >= search_req.max_results:
                    break
        else:
            # Sem filtros específicos, retorna todos
            results = all_videos[:search_req.max_results]
        
        # Cache videos
        for video in results:
            video_doc = video.model_dump()
            video_doc["cached_at"] = datetime.now(timezone.utc)
            await db.video_cache.update_one(
                {"video_id": video.video_id},
                {"$set": video_doc},
                upsert=True
            )
        
        # Save to search history
        history_doc = {
            "history_id": f"hist_{uuid.uuid4().hex[:12]}",
            "user_id": current_user.user_id,
            "query": search_req.query,
            "filters": {
                "player": search_req.player,
                "team": search_req.team,
                "goal_type": search_req.goal_type,
                "year": search_req.year,
                "championship": search_req.championship,
                "historic_goal": search_req.historic_goal,
                "beautiful_goal": search_req.beautiful_goal,
                "ex_goal": search_req.ex_goal,
                "own_goal": search_req.own_goal,
                "only_this_player": search_req.only_this_player
            },
            "results_count": len(results),
            "created_at": datetime.now(timezone.utc)
        }
        background_tasks.add_task(db.search_history.insert_one, history_doc)
        
        return results
    
    except HttpError as e:
        logger.error(f"YouTube API error: {e}")
        if "quotaExceeded" in str(e):
            raise HTTPException(status_code=429, detail="YouTube API quota exceeded")
        raise HTTPException(status_code=400, detail="Error searching videos")

@api_router.get("/goals/history", response_model=List[SearchHistoryItem])
async def get_search_history(current_user: User = Depends(get_current_user)):
    """Get user's search history"""
    history = await db.search_history.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return [SearchHistoryItem(**item) for item in history]

# User Profile endpoints
@api_router.get("/profile")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get user profile"""
    profile = await db.user_profiles.find_one({"user_id": current_user.user_id}, {"_id": 0})
    if not profile:
        return {"user_id": current_user.user_id, "full_name": None, "age": None, "address": None, "favorite_team": None, "city": None, "state": None, "country": "Brasil"}
    return profile

@api_router.put("/profile")
async def update_profile(profile_data: dict, current_user: User = Depends(get_current_user)):
    """Update user profile"""
    profile_doc = {
        "user_id": current_user.user_id,
        **profile_data,
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.user_profiles.update_one(
        {"user_id": current_user.user_id},
        {"$set": profile_doc},
        upsert=True
    )
    
    return {"message": "Profile updated successfully", "profile": profile_doc}

# Admin endpoints
@api_router.get("/admin/dashboard")
async def get_admin_dashboard(current_user: User = Depends(get_current_user)):
    """Get admin dashboard statistics"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Users today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    users_today = await db.users.count_documents({"created_at": {"$gte": today_start}})
    
    # Users this month
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    users_this_month = await db.users.count_documents({"created_at": {"$gte": month_start}})
    
    # Top states
    pipeline_states = [
        {"$lookup": {"from": "user_profiles", "localField": "user_id", "foreignField": "user_id", "as": "profile"}},
        {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
        {"$group": {"_id": "$profile.state", "count": {"$sum": 1}}},
        {"$match": {"_id": {"$ne": None}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_states = await db.users.aggregate(pipeline_states).to_list(5)
    
    # Top teams
    pipeline_teams = [
        {"$lookup": {"from": "user_profiles", "localField": "user_id", "foreignField": "user_id", "as": "profile"}},
        {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
        {"$group": {"_id": "$profile.favorite_team", "count": {"$sum": 1}}},
        {"$match": {"_id": {"$ne": None}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_teams = await db.users.aggregate(pipeline_teams).to_list(10)
    
    # Most searched player
    pipeline_players = [
        {"$unwind": "$filters"},
        {"$match": {"filters.player": {"$ne": None}}},
        {"$group": {"_id": "$filters.player", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_players = await db.search_history.aggregate(pipeline_players).to_list(10)
    
    # Most searched team
    pipeline_search_teams = [
        {"$unwind": "$filters"},
        {"$match": {"filters.team": {"$ne": None}}},
        {"$group": {"_id": "$filters.team", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    top_searched_teams = await db.search_history.aggregate(pipeline_search_teams).to_list(10)
    
    # Total searches
    total_searches = await db.search_history.count_documents({})
    
    return {
        "total_users": total_users,
        "users_today": users_today,
        "users_this_month": users_this_month,
        "top_states": top_states,
        "top_teams": top_teams,
        "top_players": top_players,
        "top_searched_teams": top_searched_teams,
        "total_searches": total_searches
    }

@api_router.get("/admin/users")
async def get_all_users_with_details(current_user: User = Depends(get_current_user)):
    """Get all users with profiles and search history"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pipeline = [
        {"$lookup": {"from": "user_profiles", "localField": "user_id", "foreignField": "user_id", "as": "profile"}},
        {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
        {"$lookup": {"from": "search_history", "localField": "user_id", "foreignField": "user_id", "as": "searches"}},
        {"$project": {
            "_id": 0,
            "password": 0
        }}
    ]
    
    users = await db.users.aggregate(pipeline).to_list(1000)
    return users

@api_router.post("/admin/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, password_data: dict, current_user: User = Depends(get_current_user)):
    """Reset user password (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_password = password_data.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="New password required")
    
    hashed_pwd = hash_password(new_password)
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"password": hashed_pwd}}
    )
    
    return {"message": "Password reset successfully"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user_admin(user_id: str, current_user: User = Depends(get_current_user)):
    """Delete user (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete related data
    await db.user_profiles.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.search_history.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

# Admin endpoints - Duplicate removed
@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [User(**user) for user in users]

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user sessions and history
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.search_history.delete_many({"user_id": user_id})
    
    return {"message": "User deleted successfully"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()