import { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './db/index.js';
import { users, stores, customers, rewards, leads, redemptions, transactions } from './db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, createStoreSchema, createCustomerSchema, createRewardSchema, leadSchema, customerLoginSchema } from './schemas/validation.js';
import { emailService } from './services/emailService.js';
import { isValidEmail, generateSlug, generateId } from './utils/helpers.js';

// Middleware de autenticação
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pathArray = req.query.path as string[];
  const route = pathArray ? pathArray.join('/') : '';
  
  console.log(`${req.method} /api/${route}`);

  try {
    const db = getDb();

    // === ROTAS PÚBLICAS ===
    
    // Login
    if (route === 'login' && req.method === 'POST') {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (user.length === 0 || !await bcrypt.compare(password, user[0].password)) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const foundUser = user[0];
      const token = jwt.sign(
        { userId: foundUser.id, email: foundUser.email, role: foundUser.role, storeId: foundUser.storeId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          storeId: foundUser.storeId
        }
      });
    }

    // Criar lead
    if (route === 'leads' && req.method === 'POST') {
      const { name, email, phone, company, message } = leadSchema.parse(req.body);
      
      await db.insert(leads).values({
        id: generateId(),
        name,
        email,
        phone,
        company,
        message,
        status: 'new',
        source: 'website',
        createdAt: new Date().toISOString()
      });

      try {
        await emailService.sendLeadNotification({ name, email, phone, company, message });
      } catch (emailError) {
        console.error('Failed to send lead notification email:', emailError);
      }

      return res.status(201).json({ message: 'Lead capturado com sucesso' });
    }

    // === MIDDLEWARE DE AUTENTICAÇÃO ===
    let user = null;
    if (route.startsWith('admin/') || route.startsWith('store/')) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Token inválido' });
      }
      
      const userResult = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (userResult.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }
      
      user = userResult[0];
    }

    // === ROTAS ADMIN ===
    
    // Admin Dashboard
    if (route === 'admin/dashboard' && req.method === 'GET') {
      if (user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const [activeStores, inactiveStores, totalLeads, totalCustomers, recentStores] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(stores).where(eq(stores.isActive, true)),
        db.select({ count: sql`count(*)` }).from(stores).where(eq(stores.isActive, false)),
        db.select({ count: sql`count(*)` }).from(leads),
        db.select({ count: sql`count(*)` }).from(customers),
        db.select().from(stores).orderBy(desc(stores.createdAt)).limit(5)
      ]);

      return res.json({
        stats: {
          activeStores: Number(activeStores[0].count),
          inactiveStores: Number(inactiveStores[0].count),
          totalLeads: Number(totalLeads[0].count),
          totalCustomers: Number(totalCustomers[0].count)
        },
        recentStores
      });
    }

    // Admin - Lista de lojas
    if (route === 'admin/stores' && req.method === 'GET') {
      if (user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const storesList = await db.select({
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
        cnpj: stores.cnpj,
        segment: stores.segment,
        ownerEmail: stores.ownerEmail,
        isActive: stores.isActive,
        createdAt: stores.createdAt,
        customUrl: stores.customUrl
      }).from(stores).orderBy(desc(stores.createdAt));

      return res.json(storesList);
    }

    // === ROTAS STORE ===
    
    // Store Dashboard
    if (route === 'store/dashboard' && req.method === 'GET') {
      if (user?.role !== 'store_owner' || !user?.storeId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const [store, totalCustomers, activeRewards, monthlyRedemptions, totalPoints] = await Promise.all([
        db.select().from(stores).where(eq(stores.id, user.storeId)).limit(1),
        db.select({ count: sql`count(*)` }).from(customers).where(eq(customers.storeId, user.storeId)),
        db.select({ count: sql`count(*)` }).from(rewards).where(and(eq(rewards.storeId, user.storeId), eq(rewards.isActive, true))),
        db.select({ count: sql`count(*)` }).from(redemptions).where(eq(redemptions.storeId, user.storeId)),
        db.select({ total: sql`sum(${customers.totalPoints})` }).from(customers).where(eq(customers.storeId, user.storeId))
      ]);

      return res.json({
        store: store[0],
        stats: {
          totalCustomers: Number(totalCustomers[0].count),
          activeRewards: Number(activeRewards[0].count),
          monthlyRedemptions: Number(monthlyRedemptions[0].count),
          totalPointsInCirculation: Number(totalPoints[0].total || 0)
        }
      });
    }

    return res.status(404).json({ error: 'Rota não encontrada' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}