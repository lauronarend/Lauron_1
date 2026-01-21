import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../components/Logo';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { currentKit } = useTheme();
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', name: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerForm.email, registerForm.password, registerForm.name);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#09090b' }}>
      <div className="w-full max-width-md">
        <div className="text-center mb-8">
          <Logo size="normal" animated={false} />
          <p className="text-gray-400 mt-4" style={{ fontFamily: '"Chivo", sans-serif' }}>
            Encontre os melhores gols do futebol mundial
          </p>
        </div>

        <Card className="bg-[#18181b] border-[#27272a]">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="register-tab">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="text-white">Entrar</CardTitle>
                  <CardDescription>Entre com sua conta existente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input
                      id="login-email"
                      data-testid="login-email-input"
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white">Senha</Label>
                    <Input
                      id="login-password"
                      data-testid="login-password-input"
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    data-testid="login-submit-button"
                    className="w-full h-12 font-bold uppercase tracking-wide"
                    style={{
                      background: currentKit?.primary || '#FFDF00',
                      color: currentKit?.primaryForeground || '#009C3B',
                      transform: 'skewX(-10deg)'
                    }}
                    disabled={loading}
                  >
                    <span style={{ transform: 'skewX(10deg)', display: 'block' }}>
                      {loading ? 'Entrando...' : 'Entrar'}
                    </span>
                  </Button>
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#27272a]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#18181b] px-2 text-gray-400">Ou</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    data-testid="google-login-button"
                    variant="outline"
                    className="w-full h-12 border-[#27272a] hover:bg-[#27272a] text-white"
                    onClick={handleGoogleLogin}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    <span className="text-white">Entrar com Google</span>
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle className="text-white">Criar Conta</CardTitle>
                  <CardDescription>Crie uma nova conta para começar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-white">Nome</Label>
                    <Input
                      id="register-name"
                      data-testid="register-name-input"
                      type="text"
                      placeholder="Seu Nome"
                      className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white">Email</Label>
                    <Input
                      id="register-email"
                      data-testid="register-email-input"
                      type="email"
                      placeholder="seu@email.com"
                      className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white">Senha</Label>
                    <Input
                      id="register-password"
                      data-testid="register-password-input"
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#27272a] border-[#3f3f46] text-white h-12"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit"
                    data-testid="register-submit-button"
                    className="w-full h-12 font-bold uppercase tracking-wide"
                    style={{
                      background: currentKit?.primary || '#FFDF00',
                      color: currentKit?.primaryForeground || '#009C3B',
                      transform: 'skewX(-10deg)'
                    }}
                    disabled={loading}
                  >
                    <span style={{ transform: 'skewX(10deg)', display: 'block' }}>
                      {loading ? 'Criando...' : 'Criar Conta'}
                    </span>
                  </Button>

                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#27272a]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#18181b] px-2 text-gray-400">Ou</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    data-testid="google-register-button"
                    variant="outline"
                    className="w-full h-12 border-[#27272a] hover:bg-[#27272a] text-white"
                    onClick={handleGoogleLogin}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    <span className="text-white">Continuar com Google</span>
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm" style={{ color: currentKit?.primary || '#FFDF00' }}>
            ← Voltar para início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;