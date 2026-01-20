from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    favorite_team: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    updated_at: datetime

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    favorite_team: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "Brasil"

class PasswordReset(BaseModel):
    new_password: str