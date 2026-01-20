import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Search, LogOut, History, X, Play, User, Settings } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProfileModal from '../components/ProfileModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { currentKit } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [player, setPlayer] = useState('');
  const [team, setTeam] = useState('');
  const [goalType, setGoalType] = useState('');
  const [year, setYear] = useState('');
  const [championship, setChampionship] = useState('');
  const [historicGoal, setHistoricGoal] = useState(false);
  const [beautifulGoal, setBeautifulGoal] = useState(false);
  const [exGoal, setExGoal] = useState(false);
  const [ownGoal, setOwnGoal] = useState(false);
  const [onlyThisPlayer, setOnlyThisPlayer] = useState(false);
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/goals/history`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchHistory(response.data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Verificar se há pelo menos um campo preenchido
    const hasAnyFilter = searchQuery.trim() || player.trim() || team.trim() || 
                         goalType || year.trim() || championship || 
                         historicGoal || beautifulGoal || exGoal || ownGoal || onlyThisPlayer;
    
    if (!hasAnyFilter) {
      toast.error('Preencha pelo menos um campo ou selecione um filtro para buscar');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/goals/search`,
        {
          query: searchQuery || "gol goal",
          player: player || null,
          team: team || null,
          goal_type: goalType || null,
          year: year || null,
          championship: championship || null,
          historic_goal: historicGoal,
          beautiful_goal: beautifulGoal,
          ex_goal: exGoal,
          own_goal: ownGoal,
          only_this_player: onlyThisPlayer,
          max_results: 20
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setVideos(response.data);
      loadHistory();
      if (response.data.length === 0) {
        toast.info('Nenhum vídeo encontrado. Tente outros termos.');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao buscar vídeos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const clearFilters = () => {
    setPlayer('');
    setTeam('');
    setGoalType('');
    setYear('');
    setChampionship('');
    setHistoricGoal(false);
    setBeautifulGoal(false);
    setExGoal(false);
    setOwnGoal(false);
    setOnlyThisPlayer(false);
  };

  const hasFilters = player || team || goalType || year || championship || historicGoal || beautifulGoal || exGoal || ownGoal || onlyThisPlayer;

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#09090b] sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black" style={{ 
              fontFamily: '"Barlow Condensed", sans-serif',
              color: currentKit?.primary || '#FFDF00',
              letterSpacing: '-0.02em'
            }}>
              GOLTUBE
            </h1>
            <div className="flex items-center gap-4">
              <Button
                data-testid="history-button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-gray-400 hover:text-white"
              >
                <History className="h-5 w-5 mr-2" />
                Histórico
              </Button>
              <Avatar data-testid="user-avatar">
                <AvatarImage src={user.picture} />
                <AvatarFallback className="bg-[#27272a]" style={{ color: currentKit?.primary || '#FFDF00' }}>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                data-testid="logout-button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-3xl font-black mb-2 text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
            BEM-VINDO, {user.name.toUpperCase()}
          </h2>
          <p className="text-gray-400 mb-8" style={{ fontFamily: '"Chivo", sans-serif' }}>
            Encontre os melhores gols de futebol de todos os tempos
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search */}
            <div className="relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                style={{ color: currentKit?.primary || '#FFDF00' }}
              />
              <Input
                data-testid="dashboard-search-input"
                type="text"
                placeholder="Buscar gols (opcional se usar filtros abaixo)"
                className="w-full h-14 pl-12 bg-[#27272a] border-[#3f3f46] text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                data-testid="player-filter-input"
                type="text"
                placeholder="Jogador"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
              />
              <Input
                data-testid="team-filter-input"
                type="text"
                placeholder="Time"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              />
              <Input
                data-testid="year-filter-input"
                type="text"
                placeholder="Ano (ex: 2010)"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger data-testid="goal-type-filter" className="bg-[#27272a] border-[#3f3f46] text-white h-12">
                  <SelectValue placeholder="Tipo de Gol" />
                </SelectTrigger>
                <SelectContent className="bg-[#27272a] border-[#3f3f46]">
                  <SelectItem value="bicicleta" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Bicicleta</SelectItem>
                  <SelectItem value="cabeça" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Cabeça</SelectItem>
                  <SelectItem value="fora da área" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Fora da Área</SelectItem>
                  <SelectItem value="pé-esquerdo" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Pé Esquerdo</SelectItem>
                  <SelectItem value="pé-direito" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Pé Direito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Championship Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={championship} onValueChange={setChampionship}>
                <SelectTrigger data-testid="championship-filter" className="bg-[#27272a] border-[#3f3f46] text-white h-12">
                  <SelectValue placeholder="Campeonato" />
                </SelectTrigger>
                <SelectContent className="bg-[#27272a] border-[#3f3f46]">
                  <SelectItem value="copa do mundo" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Copa do Mundo</SelectItem>
                  <SelectItem value="campeonato nacional" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Campeonato Nacional</SelectItem>
                  <SelectItem value="libertadores" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Libertadores</SelectItem>
                  <SelectItem value="mundial de clubes" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Mundial de Clubes</SelectItem>
                  <SelectItem value="campeonato regional/estadual" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Campeonato Regional/Estadual</SelectItem>
                  <SelectItem value="copa continental" className="text-white hover:bg-[#3f3f46] focus:bg-[#3f3f46] focus:text-white">Copa Continental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#18181b] border border-[#27272a] rounded">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="historic" 
                  checked={historicGoal} 
                  onCheckedChange={setHistoricGoal}
                  data-testid="historic-goal-checkbox"
                  className="border-gray-400"
                />
                <Label htmlFor="historic" className="text-white text-sm cursor-pointer">
                  Gol Histórico
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="beautiful" 
                  checked={beautifulGoal} 
                  onCheckedChange={setBeautifulGoal}
                  data-testid="beautiful-goal-checkbox"
                  className="border-gray-400"
                />
                <Label htmlFor="beautiful" className="text-white text-sm cursor-pointer">
                  Gol Mais Bonito
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ex" 
                  checked={exGoal} 
                  onCheckedChange={setExGoal}
                  data-testid="ex-goal-checkbox"
                  className="border-gray-400"
                />
                <Label htmlFor="ex" className="text-white text-sm cursor-pointer">
                  Gol do Ex
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="own" 
                  checked={ownGoal} 
                  onCheckedChange={setOwnGoal}
                  data-testid="own-goal-checkbox"
                  className="border-gray-400"
                />
                <Label htmlFor="own" className="text-white text-sm cursor-pointer">
                  Gol Contra
                </Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                data-testid="search-submit-button"
                type="submit"
                className="h-12 px-8 font-bold uppercase tracking-wide"
                style={{
                  background: currentKit?.primary || '#FFDF00',
                  color: currentKit?.primaryForeground || '#009C3B',
                  transform: 'skewX(-10deg)'
                }}
                disabled={loading}
              >
                <span style={{ transform: 'skewX(10deg)', display: 'block' }}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </span>
              </Button>
              {hasFilters && (
                <Button
                  data-testid="clear-filters-button"
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="fixed right-0 top-0 h-full w-80 bg-[#18181b] border-l border-[#27272a] p-6 overflow-y-auto z-40" data-testid="history-sidebar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                HISTÓRICO
              </h3>
              <Button
                data-testid="close-history-button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
              >
                <X className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
            <div className="space-y-4">
              {searchHistory.length === 0 ? (
                <p className="text-gray-400 text-sm" style={{ fontFamily: '"Chivo", sans-serif' }}>
                  Nenhuma busca ainda
                </p>
              ) : (
                searchHistory.map((item, index) => (
                  <div 
                    key={item.history_id || index} 
                    className="p-3 bg-[#27272a] rounded cursor-pointer hover:bg-[#3f3f46]"
                    onClick={() => {
                      setSearchQuery(item.query);
                      setPlayer(item.filters.player || '');
                      setTeam(item.filters.team || '');
                      setGoalType(item.filters.goal_type || '');
                      setYear(item.filters.year || '');
                      setChampionship(item.filters.championship || '');
                      setHistoricGoal(item.filters.historic_goal || false);
                      setBeautifulGoal(item.filters.beautiful_goal || false);
                      setExGoal(item.filters.ex_goal || false);
                      setOwnGoal(item.filters.own_goal || false);
                      setShowHistory(false);
                    }}
                    data-testid={`history-item-${index}`}
                  >
                    <p className="text-white text-sm font-medium" style={{ fontFamily: '"Chivo", sans-serif' }}>
                      {item.query}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {item.results_count} resultados
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {videos.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl font-black mb-6 text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
              RESULTADOS ({videos.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={video.video_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-[#18181b] overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                  data-testid={`video-card-${index}`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video overflow-hidden group">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-16 w-16 text-white" style={{ color: currentKit?.primary || '#FFDF00' }} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-bold mb-2 line-clamp-2" style={{ fontFamily: '"Chivo", sans-serif' }}>
                      {video.title}
                    </h4>
                    <p className="text-gray-400 text-sm" style={{ fontFamily: '"Chivo", sans-serif' }}>
                      {video.channel_title}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="max-w-3xl mx-auto text-center py-20" data-testid="empty-state">
            <Search className="h-20 w-20 mx-auto mb-6 text-gray-600" />
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
              COMECE SUA BUSCA
            </h3>
            <p className="text-gray-400" style={{ fontFamily: '"Chivo", sans-serif' }}>
              Use a barra de busca acima para encontrar os melhores gols de futebol
            </p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl bg-[#18181b] border-[#27272a]">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {selectedVideo && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <div className="mt-4">
            <p className="text-gray-400 text-sm" style={{ fontFamily: '"Chivo", sans-serif' }}>
              Canal: {selectedVideo?.channel_title}
            </p>
            <p className="text-gray-400 text-sm mt-2" style={{ fontFamily: '"Chivo", sans-serif' }}>
              {selectedVideo?.description?.substring(0, 200)}...
            </p>
            <a 
              href={`https://www.youtube.com/watch?v=${selectedVideo?.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm"
              style={{ color: currentKit?.primary || '#FFDF00' }}
            >
              Abrir no YouTube →
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;