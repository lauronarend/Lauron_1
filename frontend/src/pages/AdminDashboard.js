import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { ArrowLeft, Users, Search as SearchIcon, TrendingUp, BarChart3, Key, Trash2, Settings, Download, Mail } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import Logo from '../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const { currentKit } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    email_to: '',
    send_daily: false,
    send_weekly: false,
    send_monthly: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.is_admin) {
      navigate('/dashboard');
      toast.error('Acesso negado. Você não é administrador.');
    } else {
      loadData();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.profile?.full_name && u.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [statsResponse, usersResponse, profileResponse, emailSettingsResponse] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/users`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/profile`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/email-settings`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setFilteredUsers(usersResponse.data);
      setAdminWhatsApp(profileResponse.data?.whatsapp_number || '');
      setEmailSettings(emailSettingsResponse.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/users/${resetPasswordUser.user_id}/reset-password`,
        { new_password: newPassword },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Senha resetada com sucesso!');
      setResetPasswordUser(null);
      setNewPassword('');
    } catch (error) {
      toast.error('Erro ao resetar senha');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário ${userEmail}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/admin/users/${userId}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Usuário deletado com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao deletar usuário');
    }
  };

  const handleSaveWhatsApp = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/profile`,
        { whatsapp_number: adminWhatsApp },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Número do WhatsApp atualizado!');
      setShowSettings(false);
    } catch (error) {
      toast.error('Erro ao atualizar WhatsApp');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/admin/export-csv`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('CSV baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleSaveEmailSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/email-settings`,
        emailSettings,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Configurações de email salvas!');
      setShowEmailSettings(false);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleSendNow = async () => {
    if (!emailSettings.email_to) {
      toast.error('Por favor, preencha o email primeiro');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/admin/send-report-now`,
        { email_to: emailSettings.email_to },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Relatório enviado por email!');
    } catch (error) {
      toast.error('Erro ao enviar email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#09090b]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo size="small" />
              <h2 className="text-2xl font-black text-white ml-4" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                PAINEL ADMINISTRATIVO
              </h2>
            </div>
            <Button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
              style={{ background: currentKit?.primary || '#FFDF00', color: currentKit?.primaryForeground || '#009C3B' }}
            >
              <Settings className="h-5 w-5" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total de Usuários</CardDescription>
              <CardTitle className="text-4xl font-black" style={{ 
                fontFamily: '"Barlow Condensed", sans-serif',
                color: currentKit?.primary || '#FFDF00'
              }}>
                {stats?.total_users || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-400">
                <Users className="h-4 w-4 mr-2" />
                Desde o início
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Usuários Hoje</CardDescription>
              <CardTitle className="text-4xl font-black" style={{ 
                fontFamily: '"Barlow Condensed", sans-serif',
                color: '#22c55e'
              }}>
                {stats?.users_today || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-400">
                <TrendingUp className="h-4 w-4 mr-2" />
                Novos cadastros
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Usuários Este Mês</CardDescription>
              <CardTitle className="text-4xl font-black" style={{ 
                fontFamily: '"Barlow Condensed", sans-serif',
                color: '#3b82f6'
              }}>
                {stats?.users_this_month || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-400">
                <BarChart3 className="h-4 w-4 mr-2" />
                Crescimento mensal
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">Total de Buscas</CardDescription>
              <CardTitle className="text-4xl font-black" style={{ 
                fontFamily: '"Barlow Condensed", sans-serif',
                color: '#a855f7'
              }}>
                {stats?.total_searches || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-400">
                <SearchIcon className="h-4 w-4 mr-2" />
                Pesquisas realizadas
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top States */}
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader>
              <CardTitle className="text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                ESTADOS COM MAIS USUÁRIOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_states?.length > 0 ? (
                  stats.top_states.map((state, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-white">{state._id || 'Não informado'}</span>
                      <span className="text-gray-400 font-bold">{state.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Teams */}
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader>
              <CardTitle className="text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                TIMES FAVORITOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_teams?.length > 0 ? (
                  stats.top_teams.map((team, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-white">{team._id || 'Não informado'}</span>
                      <span className="text-gray-400 font-bold">{team.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Players */}
          <Card className="bg-[#18181b] border-[#27272a]">
            <CardHeader>
              <CardTitle className="text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                JOGADORES MAIS BUSCADOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_players?.length > 0 ? (
                  stats.top_players.map((player, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-white">{player._id}</span>
                      <span className="text-gray-400 font-bold">{player.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Nenhum dado disponível</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-[#18181b] border-[#27272a]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-2xl" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                GERENCIAMENTO DE USUÁRIOS
              </CardTitle>
              <Input
                type="text"
                placeholder="Buscar usuário..."
                className="w-64 bg-[#27272a] border-[#3f3f46] text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th className="text-left p-3 text-gray-400 font-bold">Nome</th>
                    <th className="text-left p-3 text-gray-400 font-bold">Email</th>
                    <th className="text-left p-3 text-gray-400 font-bold">Cidade/Estado</th>
                    <th className="text-left p-3 text-gray-400 font-bold">Time</th>
                    <th className="text-left p-3 text-gray-400 font-bold">Buscas</th>
                    <th className="text-right p-3 text-gray-400 font-bold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, index) => (
                    <tr key={u.user_id || index} className="border-b border-[#27272a] hover:bg-[#27272a]">
                      <td className="p-3 text-white">{u.profile?.full_name || u.name}</td>
                      <td className="p-3 text-gray-400">{u.email}</td>
                      <td className="p-3 text-gray-400">
                        {u.profile?.city && u.profile?.state ? `${u.profile.city}/${u.profile.state}` : '-'}
                      </td>
                      <td className="p-3 text-gray-400">{u.profile?.favorite_team || '-'}</td>
                      <td className="p-3 text-gray-400">{u.searches?.length || 0}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setResetPasswordUser(u)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteUser(u.user_id, u.email)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={() => setResetPasswordUser(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a]">
          <DialogHeader>
            <DialogTitle className="text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
              RESETAR SENHA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-400">
              Resetar senha do usuário: <span className="text-white font-bold">{resetPasswordUser?.email}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Digite a nova senha"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setResetPasswordUser(null);
                setNewPassword('');
              }}
              className="text-gray-400"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              style={{ background: currentKit?.primary || '#FFDF00', color: currentKit?.primaryForeground || '#009C3B' }}
            >
              Resetar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#18181b] border-[#27272a]">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
              CONFIGURAÇÕES DO ADMINISTRADOR
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-white">Número do WhatsApp (com código do país)</Label>
              <Input
                id="whatsapp"
                type="text"
                placeholder="Ex: 5511941863112"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={adminWhatsApp}
                onChange={(e) => setAdminWhatsApp(e.target.value)}
              />
              <p className="text-xs text-gray-400">
                Este número aparecerá no botão flutuante de WhatsApp em todo o site
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSettings(false)}
              className="text-gray-400"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveWhatsApp}
              style={{ background: currentKit?.primary || '#FFDF00', color: currentKit?.primaryForeground || '#009C3B' }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
