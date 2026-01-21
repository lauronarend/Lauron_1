import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Search, PlayCircle, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const Landing = () => {
  const navigate = useNavigate();
  const { currentKit } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/login', { state: { searchQuery } });
    } else {
      navigate('/login');
    }
  };

  const stats = [
    { label: 'Vídeos Disponíveis', value: '100K+', icon: PlayCircle },
    { label: 'Times Cobertos', value: '500+', icon: TrendingUp },
    { label: 'Tipos de Gol', value: '10+', icon: History },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
        opacity: 0.03
      }} />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black" style={{ 
            fontFamily: '"Barlow Condensed", sans-serif',
            color: currentKit?.primary || '#FFDF00',
            letterSpacing: '-0.02em'
          }}>
            GOLTUBE
          </h1>
          <div className="flex gap-3">
            <Link to="/login">
              <Button 
                data-testid="header-login-button"
                variant="outline" 
                className="border-[#27272a] hover:bg-[#27272a] text-white"
              >
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6"
            style={{ 
              fontFamily: '"Barlow Condensed", sans-serif',
              color: '#fafafa',
              letterSpacing: '-0.02em'
            }}
          >
            ENCONTRE OS<br />
            <span style={{ color: currentKit?.primary || '#FFDF00' }}>MELHORES GOLS</span><br />
            DO FUTEBOL
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 mb-12"
            style={{ fontFamily: '"Chivo", sans-serif' }}
          >
            Busque gols por jogador, time ou tipo. Mais de 100 mil vídeos de todos os tempos.
          </motion.p>

          {/* Search Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSearch}
            className="relative max-w-3xl mx-auto"
          >
            <div className="relative">
              <Search 
                className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6" 
                style={{ color: currentKit?.primary || '#FFDF00' }}
              />
              <input
                type="text"
                data-testid="hero-search-input"
                placeholder="Faça login para buscar gols..."
                className="w-full h-16 pl-16 pr-6 rounded-none bg-[#27272a] border-2 text-white text-lg cursor-pointer"
                style={{ 
                  borderColor: currentKit?.primary || '#FFDF00',
                  fontFamily: '"Chivo", sans-serif',
                  outline: 'none'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => navigate('/login')}
                readOnly
              />
            </div>
            <Button
              type="submit"
              data-testid="hero-search-button"
              className="mt-4 h-14 px-12 font-bold uppercase tracking-wide"
              style={{
                background: currentKit?.primary || '#FFDF00',
                color: currentKit?.primaryForeground || '#009C3B',
                transform: 'skewX(-10deg)'
              }}
              onClick={() => navigate('/login')}
            >
              <span style={{ transform: 'skewX(10deg)', display: 'block' }}>
                Fazer Login
              </span>
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="bg-[#18181b] border-[#27272a] border-l-4 p-8"
                style={{ 
                  borderLeftColor: currentKit?.primary || '#FFDF00'
                }}
                data-testid={`stat-card-${index}`}
              >
                <Icon className="h-12 w-12 mb-4" style={{ color: currentKit?.primary || '#FFDF00' }} />
                <div className="text-5xl font-black mb-2" style={{ 
                  fontFamily: '"Barlow Condensed", sans-serif',
                  color: '#fafafa'
                }}>
                  {stat.value}
                </div>
                <div className="text-gray-400" style={{ fontFamily: '"Chivo", sans-serif' }}>
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl sm:text-5xl font-black text-center mb-16" style={{ 
            fontFamily: '"Barlow Condensed", sans-serif',
            color: '#fafafa',
            letterSpacing: '-0.02em'
          }}>
            COMO FUNCIONA
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="feature-search">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                background: currentKit?.primary || '#FFDF00'
              }}>
                <Search className="h-10 w-10" style={{ color: currentKit?.primaryForeground || '#009C3B' }} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                1. BUSQUE
              </h4>
              <p className="text-gray-400" style={{ fontFamily: '"Chivo", sans-serif' }}>
                Digite o nome do jogador, time ou tipo de gol que você quer encontrar
              </p>
            </div>

            <div className="text-center" data-testid="feature-filter">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                background: currentKit?.primary || '#FFDF00'
              }}>
                <TrendingUp className="h-10 w-10" style={{ color: currentKit?.primaryForeground || '#009C3B' }} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                2. FILTRE
              </h4>
              <p className="text-gray-400" style={{ fontFamily: '"Chivo", sans-serif' }}>
                Use filtros avançados para encontrar exatamente o que procura
              </p>
            </div>

            <div className="text-center" data-testid="feature-watch">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                background: currentKit?.primary || '#FFDF00'
              }}>
                <PlayCircle className="h-10 w-10" style={{ color: currentKit?.primaryForeground || '#009C3B' }} />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: '"Barlow Condensed", sans-serif' }}>
                3. ASSISTA
              </h4>
              <p className="text-gray-400" style={{ fontFamily: '"Chivo", sans-serif' }}>
                Assista aos melhores lances diretamente do YouTube
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-[#18181b] p-12 border-4" style={{
          borderColor: currentKit?.primary || '#FFDF00'
        }}>
          <h3 className="text-4xl sm:text-5xl font-black mb-6" style={{ 
            fontFamily: '"Barlow Condensed", sans-serif',
            color: '#fafafa',
            letterSpacing: '-0.02em'
          }}>
            PRONTO PARA<br />COMEÇAR?
          </h3>
          <p className="text-lg text-gray-400 mb-8" style={{ fontFamily: '"Chivo", sans-serif' }}>
            Crie sua conta gratuitamente e tenha acesso ao maior arquivo de gols do mundo
          </p>
          <Link to="/login">
            <Button
              data-testid="cta-button"
              size="lg"
              className="h-16 px-12 font-bold uppercase tracking-wide text-xl"
              style={{
                background: currentKit?.primary || '#FFDF00',
                color: currentKit?.primaryForeground || '#009C3B',
                transform: 'skewX(-10deg)'
              }}
            >
              <span style={{ transform: 'skewX(10deg)', display: 'block' }}>
                Criar Conta Grátis
              </span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#27272a] py-8">
        <div className="container mx-auto px-4 text-center text-gray-400" style={{ fontFamily: '"Chivo", sans-serif' }}>
          <p>© 2025 GolTube. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;