# GolTube - Plataforma de Busca de Gols de Futebol

## 🎯 Visão Geral

GolTube é uma plataforma completa para buscar e assistir gols de futebol do mundo todo através do YouTube. Com filtros avançados, você pode encontrar gols específicos por jogador, time ou tipo de gol.

## ✨ Funcionalidades

- **Busca Avançada**: Busque gols por jogador, time ou tipo (bicicleta, cabeça, fora da área, etc.)
- **Autenticação**: Login com email/senha ou Google OAuth
- **Histórico**: Acompanhe suas buscas anteriores
- **Tema Dinâmico**: Cores vibrantes que mudam a cada acesso (inspiradas em camisas de times)
- **Admin Panel**: Gerenciamento de usuários (funcionalidade admin)

## 🎨 Design

- **Fontes**: Barlow Condensed (títulos), Chivo (corpo)
- **Cores**: Sistema dinâmico com 5 temas diferentes (Brasil, Argentina, Espanha, França, Alemanha)
- **Estilo**: Dark mode com cores vibrantes e design esportivo

## 🚀 Configuração

### Pré-requisitos

- Python 3.11+
- Node.js 18+
- MongoDB
- YouTube Data API v3 Key

### Obter YouTube API Key

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **YouTube Data API v3**
4. Vá em "Credenciais" → "Criar Credenciais" → "Chave de API"
5. Copie a chave gerada
6. Cole a chave em `/app/backend/.env`:
   ```
   YOUTUBE_API_KEY="SUA_CHAVE_AQUI"
   ```
7. Reinicie o backend: `sudo supervisorctl restart backend`

### Instalação

Backend:
```bash
cd /app/backend
pip install -r requirements.txt
```

Frontend:
```bash
cd /app/frontend
yarn install
```

### Executar

Os serviços já estão configurados com supervisor e devem iniciar automaticamente.

Para reiniciar manualmente:
```bash
sudo supervisorctl restart backend frontend
```

## 📝 Uso

1. **Landing Page**: Acesse `http://localhost:3000`
2. **Criar Conta**: Clique em "Entrar" → "Criar Conta"
3. **Login**: Use email/senha ou Google OAuth
4. **Buscar Gols**: No dashboard, use a barra de busca e filtros
5. **Ver Histórico**: Clique no ícone de histórico no header

## 🔑 Autenticação

### Email/Senha (JWT)
- Registro e login tradicionais
- Token JWT com 7 dias de validade

### Google OAuth (Emergent Auth)
- Login social simplificado
- Session token com 7 dias de validade
- Cookie httpOnly para segurança

## 🎯 Filtros de Busca

- **Jogador**: Nome do jogador (ex: Messi, Cristiano Ronaldo)
- **Time**: Nome do time (ex: Barcelona, Real Madrid)
- **Tipo de Gol**:
  - Bicicleta
  - Cabeça
  - Fora da Área
  - Pé Esquerdo
  - Pé Direito

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `POST /api/auth/session` - Processar Google OAuth
- `GET /api/auth/me` - Dados do usuário
- `POST /api/auth/logout` - Logout

### Vídeos
- `POST /api/goals/search` - Buscar gols
- `GET /api/goals/history` - Histórico de buscas

### Admin
- `GET /api/admin/users` - Listar usuários
- `DELETE /api/admin/users/{user_id}` - Deletar usuário

## 🔧 Tecnologias

**Backend:**
- FastAPI
- MongoDB (Motor)
- YouTube Data API v3
- JWT + Emergent Auth
- Passlib + bcrypt

**Frontend:**
- React 19
- React Router
- Axios
- Tailwind CSS
- Shadcn/UI
- Framer Motion
- Lucide Icons

## ⚠️ Importante

1. **YouTube API Quota**: A API gratuita tem limite de 10.000 unidades/dia. Cada busca consome ~100 unidades.
2. **Chave Provisória**: A chave dummy incluída não funciona. Você precisa de uma chave real do Google Cloud.
3. **Segurança**: Troque o `JWT_SECRET_KEY` em produção.

## 📝 Próximas Melhorias

- [ ] Cache de vídeos para reduzir uso da API
- [ ] Favoritos de vídeos
- [ ] Compartilhamento de buscas
- [ ] Sugestões de busca
- [ ] Estatísticas de times/jogadores
- [ ] Sistema de comentários
- [ ] Integração com mais plataformas de vídeo

## 🐛 Problemas Conhecidos

- YouTube API key provisória não funciona (requer chave real)
- Limite de quota da API pode causar erros em uso intenso

## 📄 Licença

© 2025 GolTube. Todos os direitos reservados.
