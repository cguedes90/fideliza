import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ESM modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carregar variáveis de ambiente PRIMEIRO
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// Debug: verificar se variáveis foram carregadas
console.log('🔍 Environment check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '✅ Carregada' : '❌ Não encontrada');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Carregada' : '❌ Não encontrada');
console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Carregada' : '❌ Não encontrada');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { testConnection } from './db/index.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e parsing
app.use(helmet({
  contentSecurityPolicy: false // Desabilita CSP para desenvolvimento
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://fidelizaa.com.br', 'https://www.fidelizaa.com.br']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// Configurar charset para UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Accept-Charset', 'utf-8');
  
  // Override JSON.stringify to ensure UTF-8
  const originalSend = res.send;
  res.send = function(data: any) {
    if (typeof data === 'object' && data !== null) {
      data = JSON.stringify(data, null, 0);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    return originalSend.call(this, data);
  };
  
  next();
});

// Rate limiting para segurança
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);
app.use('/api/login', authLimiter);
app.use('/api/public/customer-login', authLimiter);

// Middleware de logs para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'FidelizaPontos API'
  });
});

// Rotas da API
app.use('/api', authRoutes);

// Rota para o site principal
app.get('/', (req, res) => {
  res.json({
    message: '🎯 FidelizaPontos API',
    version: '1.0.0',
    docs: '/api-docs',
    health: '/health'
  });
});

// Rota catch-all para URLs de lojas (SPA routing)
app.get('/loja/:slug', (req, res) => {
  // Em produção, servir o frontend React
  res.json({
    message: `Página da loja: ${req.params.slug}`,
    url: `https://fidelizaa.com.br/loja/${req.params.slug}`
  });
});

// Middleware de erro global
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Inicialização do servidor
async function startServer() {
  try {
    // Testar conexão com o banco
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Falha na conexão com o banco de dados');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor FidelizaPontos iniciado!`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`🛡️  Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Criar usuário Super Admin padrão se não existir
    await createDefaultSuperAdmin();

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Criar Super Admin padrão
async function createDefaultSuperAdmin() {
  try {
    const { db } = await import('./db/index.js');
    const { users } = await import('./db/schema.js');
    const { hashPassword, generateId } = await import('./utils/helpers.js');
    const { eq } = await import('drizzle-orm');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fidelizapontos.com';
    
    // Verificar se já existe
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    
    if (existingAdmin.length === 0) {
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        console.error('❌ ADMIN_PASSWORD não configurado nas variáveis de ambiente');
        return;
      }
      
      const hashedPassword = await hashPassword(adminPassword);
      
      await db.insert(users).values({
        id: generateId(),
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Administrador',
        role: 'super_admin',
        isActive: true
      });

      console.log('✅ Super Admin criado com sucesso');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('🔑 Senha: Definida via variável de ambiente');
    }
    
  } catch (error) {
    console.error('Erro ao criar Super Admin:', error);
  }
}

// Tratamento de sinais do sistema
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Servidor finalizado pelo sistema');
  process.exit(0);
});

// Iniciar servidor
startServer();
