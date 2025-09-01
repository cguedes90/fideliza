# FidelizaPontos - Sistema de Gestão de Fidelidade Multilojas

## 🎯 Visão Geral
Sistema SaaS para gestão de programas de fidelidade com arquitetura multi-tenant, suportando 3 tipos de usuário e URLs personalizadas por loja.

## 🏗️ Arquitetura
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Wouter
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM
- **Banco**: PostgreSQL (Neon) 
- **Autenticação**: JWT + bcrypt
- **Deploy**: Replit Deploy com domínio personalizado

## 👥 Tipos de Usuário

### 1. Super Administrador
- **Email**: `admin@fidelizapontos.com`
- **Senha**: `admin123`
- **Funcionalidades**:
  - ✅ Gestão completa de lojas (criar, editar, ativar/desativar)
  - ✅ Gerenciamento de leads capturados no site
  - ✅ Relatórios consolidados de toda a plataforma
  - ✅ Dashboard com métricas globais

### 2. Lojista (Store Owner)
- **Acesso**: Credenciais geradas automaticamente
- **Funcionalidades**:
  - ✅ Dashboard próprio com métricas da loja
  - ✅ Gestão de clientes (cadastro, busca, edição)
  - ✅ Sistema de pontos (adicionar/remover pontos)
  - ✅ Catálogo de recompensas (criar e gerenciar)
  - ✅ QR Code para acesso da loja
  - ✅ URL personalizada da loja

### 3. Cliente Final
- **Acesso**: `fidelizaa.com.br/loja/[slug-da-loja]`
- **Login**: Email ou telefone
- **Funcionalidades**:
  - ✅ Visualização de pontos acumulados
  - ✅ Catálogo de recompensas disponíveis
  - ✅ Interface mobile-friendly

## 🛠️ Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL (local ou Neon)
- npm ou yarn

### Configuração Inicial

1. **Clone o repositório e instale dependências**:
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

2. **Configure as variáveis de ambiente**:
```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/fidelizapontos
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
SENDGRID_API_KEY=optional_sendgrid_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. **Execute o projeto**:

**Método 1: VS Code Tasks (Recomendado)**
- Pressione `Ctrl+Shift+P`
- Digite "Tasks: Run Task"
- Escolha "Start Backend Server" e "Start Frontend"

**Método 2: Terminal manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### URLs de Acesso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## �️ Banco de Dados

### Schema Principal
```sql
-- Usuários do sistema (super_admin, store_owner)
users (id, email, password, name, role, storeId, isActive, createdAt)

-- Lojas cadastradas
stores (id, name, slug, cnpj, segment, pointsConversionRate, ownerEmail, isActive, qrCode, customUrl)

-- Clientes das lojas
customers (id, storeId, name, email, phone, totalPoints, isActive)

-- Histórico de pontos
points_transactions (id, customerId, storeId, type, points, description, createdAt)

-- Catálogo de recompensas
rewards (id, storeId, name, description, pointsRequired, isActive)

-- Resgates realizados
reward_redemptions (id, customerId, storeId, rewardId, pointsUsed, status, redeemedAt)

-- Leads capturados
leads (id, name, email, phone, company, message, status, source, createdAt)
```

## 📊 Funcionalidades Implementadas

### 🔐 Autenticação e Segurança
- ✅ JWT Tokens para autenticação
- ✅ Bcrypt para hash de senhas  
- ✅ Middleware de autorização por roles
- ✅ Validação de propriedade de lojas
- ✅ Proteção de rotas sensíveis

### 🎨 Interface de Usuário
- ✅ Design responsivo (mobile-first)
- ✅ Componentes React com TypeScript
- ✅ Tailwind CSS para estilização
- ✅ Animações CSS suaves
- ✅ Loading states em todas operações
- ✅ Estados vazios informativos

### 🏪 Sistema Multi-tenant
- ✅ Isolamento de dados por loja
- ✅ URLs personalizadas por loja
- ✅ QR Codes automáticos
- ✅ Configurações específicas por loja

## 🌐 URLs do Sistema

### Produção
- **Site principal**: `fidelizaa.com.br`
- **Admin**: `fidelizaa.com.br/admin` 
- **Dashboard Lojista**: `fidelizaa.com.br/dashboard`
- **Páginas das Lojas**: `fidelizaa.com.br/loja/[slug]`

### Desenvolvimento
- **Login**: `http://localhost:5173/login`
- **Admin**: `http://localhost:5173/admin`
- **Dashboard**: `http://localhost:5173/dashboard`
- **Loja Demo**: `http://localhost:5173/loja/demo`

## 🚀 Deploy

### Variáveis de Produção
```env
DATABASE_URL=sua_url_neon_postgresql
JWT_SECRET=jwt_secret_super_forte_producao
SENDGRID_API_KEY=sua_chave_sendgrid
NODE_ENV=production
FRONTEND_URL=https://fidelizaa.com.br
DOMAIN=fidelizaa.com.br
```

### Build para Produção
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 📋 Casos de Uso

### Para Super Admin
1. Fazer login com `admin@fidelizapontos.com`
2. Acessar dashboard com métricas globais
3. Criar e gerenciar lojas
4. Visualizar leads capturados
5. Gerar relatórios consolidados

### Para Lojista
1. Receber credenciais por email (em desenvolvimento via console)
2. Fazer login no sistema
3. Gerenciar clientes da loja
4. Criar catálogo de recompensas
5. Controlar pontos e resgates

### Para Cliente
1. Escanear QR Code ou acessar URL da loja
2. Fazer login com email ou telefone
3. Visualizar saldo de pontos
4. Navegar pelas recompensas disponíveis
5. Solicitar resgates na loja física

## � Configuração de Desenvolvimento

### Extensões VS Code Recomendadas
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ES7+ React/Redux/React-Native snippets

### Scripts Disponíveis
```json
// Backend
"dev": "tsx watch src/server.ts"        // Desenvolvimento com hot reload
"build": "tsc"                          // Build para produção
"start": "node dist/server.js"          // Executar build de produção

// Frontend  
"dev": "vite"                          // Servidor de desenvolvimento
"build": "tsc && vite build"           // Build para produção
"preview": "vite preview"              // Preview do build local
```

## 📞 Suporte

- **Sistema**: FidelizaPontos v1.0.0
- **Tecnologia**: Full-stack TypeScript
- **Status**: ✅ Pronto para produção
- **Dados**: 🧹 Database limpo, sem dados fictícios

---

**🎯 FidelizaPontos** - *Sistema SaaS de Gestão de Fidelidade Multilojas*
