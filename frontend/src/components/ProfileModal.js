import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfileModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    address: '',
    city: '',
    state: '',
    country: 'Brasil',
    favorite_team: ''
  });

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/profile`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setProfile({
          full_name: response.data.full_name || '',
          age: response.data.age || '',
          address: response.data.address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          country: response.data.country || 'Brasil',
          favorite_team: response.data.favorite_team || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/profile`, profile, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#18181b] border-[#27272a] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
            COMPLETAR CADASTRO
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white">Nome Completo</Label>
              <Input
                id="full_name"
                data-testid="profile-full-name-input"
                type="text"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-white">Idade</Label>
              <Input
                id="age"
                data-testid="profile-age-input"
                type="number"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">Endereço</Label>
            <Input
              id="address"
              data-testid="profile-address-input"
              type="text"
              className="bg-[#27272a] border-[#3f3f46] text-white h-12"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-white">Cidade</Label>
              <Input
                id="city"
                data-testid="profile-city-input"
                type="text"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-white">Estado</Label>
              <Input
                id="state"
                data-testid="profile-state-input"
                type="text"
                placeholder="Ex: SP, RJ"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-white">País</Label>
              <Input
                id="country"
                data-testid="profile-country-input"
                type="text"
                className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="favorite_team" className="text-white">Time que Torce</Label>
            <Input
              id="favorite_team"
              data-testid="profile-team-input"
              type="text"
              placeholder="Ex: Flamengo, Corinthians, Barcelona"
              className="bg-[#27272a] border-[#3f3f46] text-white h-12"
              value={profile.favorite_team}
              onChange={(e) => setProfile({ ...profile, favorite_team: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              data-testid="profile-submit-button"
              className="flex-1 h-12 font-bold"
              style={{ background: '#FFDF00', color: '#009C3B' }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;