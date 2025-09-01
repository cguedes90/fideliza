import express from 'express';
import { db } from '../db/index.js';
import { users, stores, customers, pointsTransactions, rewards, rewardRedemptions, leads } from '../db/schema.js';
import { authenticateToken, requireSuperAdmin, generateToken } from '../middleware/auth.js';
import { hashPassword, verifyPassword, generateRandomPassword, validateCNPJ, generateSlug, generateId, isValidEmail } from '../utils/helpers.js';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { 
  loginSchema, 
  createStoreSchema, 
  createCustomerSchema, 
  pointsTransactionSchema,
  createRewardSchema,
  customerLoginSchema,
  createLeadSchema,
  validateBody 
} from '../schemas/validation.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

// LOGIN - Autenticação de usuários
router.post('/login', validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário por email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    const foundUser = user[0];

    // Verificar senha
    const passwordValid = await verifyPassword(password, foundUser.password);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!foundUser.isActive) {
      return res.status(401).json({
        error: 'Conta desativada'
      });
    }

    // Gerar token JWT
    const token = generateToken({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
      storeId: foundUser.storeId
    });

    res.json({
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        storeId: foundUser.storeId
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// DASHBOARD SUPER ADMIN
router.get('/admin/dashboard', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // Contar lojas ativas
    const activeStores = await db.select({ count: count() }).from(stores).where(eq(stores.isActive, true));
    
    // Contar lojas inativas
    const inactiveStores = await db.select({ count: count() }).from(stores).where(eq(stores.isActive, false));
    
    // Contar leads
    const totalLeads = await db.select({ count: count() }).from(leads);
    
    // Contar total de clientes
    const totalCustomers = await db.select({ count: count() }).from(customers);

    // Últimas lojas criadas
    const recentStores = await db.select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      createdAt: stores.createdAt,
      isActive: stores.isActive
    }).from(stores).orderBy(desc(stores.createdAt)).limit(5);

    res.json({
      stats: {
        activeStores: activeStores[0].count,
        inactiveStores: inactiveStores[0].count,
        totalLeads: totalLeads[0].count,
        totalCustomers: totalCustomers[0].count
      },
      recentStores
    });

  } catch (error) {
    console.error('Erro no dashboard admin:', error);
    res.status(500).json({
      error: 'Erro ao carregar dashboard'
    });
  }
});

// GESTÃO DE LOJAS - Listar todas
router.get('/admin/stores', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const allStores = await db.select({
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

    res.json(allStores);

  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({
      error: 'Erro ao carregar lojas'
    });
  }
});

// GESTÃO DE LOJAS - Criar nova loja
router.post('/admin/stores', authenticateToken, requireSuperAdmin, validateBody(createStoreSchema), async (req, res) => {
  try {
    const { name, cnpj, segment, ownerEmail, pointsConversionRate = '1.00' } = req.body;

    // Validação específica de CNPJ
    if (!validateCNPJ(cnpj)) {
      return res.status(400).json({
        error: 'CNPJ inválido'
      });
    }

    // Verificar se CNPJ já existe
    const existingStore = await db.select().from(stores).where(eq(stores.cnpj, cnpj)).limit(1);
    if (existingStore.length > 0) {
      return res.status(400).json({
        error: 'CNPJ já cadastrado'
      });
    }

    // Gerar slug único
    let slug = generateSlug(name);
    const existingSlug = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    if (existingSlug.length > 0) {
      slug = `${slug}-${generateId()}`;
    }

    // Gerar ID da loja
    const storeId = generateId();
    const customUrl = `https://fidelizaa.com.br/loja/${slug}`;

    // Criar loja
    await db.insert(stores).values({
      id: storeId,
      name,
      slug,
      cnpj,
      segment,
      ownerEmail,
      pointsConversionRate,
      customUrl,
      isActive: true
    });

    // Gerar senha para o lojista
    const password = generateRandomPassword();
    const hashedPassword = await hashPassword(password);

    // Criar usuário lojista
    const userId = generateId();
    await db.insert(users).values({
      id: userId,
      email: ownerEmail,
      password: hashedPassword,
      name: name,
      role: 'store_owner',
      storeId,
      isActive: true
    });

    // Log seguro da criação (sem senha)
    console.log(`\n🏪 Nova loja criada: ${name}`);
    console.log(`📧 Email: ${ownerEmail}`);
    console.log(`🔗 URL: ${customUrl}`);
    console.log('🔑 Credenciais enviadas via email\n');

    // TODO: Implementar envio de email com credenciais
    // await sendWelcomeEmail(ownerEmail, password, customUrl);

    res.status(201).json({
      message: 'Loja criada com sucesso',
      store: {
        id: storeId,
        name,
        slug,
        customUrl,
        ownerEmail
      },
      // Em desenvolvimento, retornar senha temporariamente
      ...(process.env.NODE_ENV === 'development' && {
        temporaryCredentials: {
          email: ownerEmail,
          password: password,
          note: 'Credenciais temporárias - em produção serão enviadas por email'
        }
      })
    });

  } catch (error) {
    console.error('Erro ao criar loja:', error);
    res.status(500).json({
      error: 'Erro ao criar loja'
    });
  }
});

// GESTÃO DE LOJAS - Atualizar loja
router.put('/admin/stores/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cnpj, segment, ownerEmail, pointsConversionRate, isActive } = req.body;

    // Validações
    if (cnpj && !validateCNPJ(cnpj)) {
      return res.status(400).json({
        error: 'CNPJ inválido'
      });
    }

    if (ownerEmail && !isValidEmail(ownerEmail)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Atualizar loja
    await db.update(stores).set({
      ...(name && { name }),
      ...(cnpj && { cnpj }),
      ...(segment && { segment }),
      ...(ownerEmail && { ownerEmail }),
      ...(pointsConversionRate && { pointsConversionRate }),
      ...(typeof isActive === 'boolean' && { isActive }),
      updatedAt: new Date()
    }).where(eq(stores.id, id));

    res.json({
      message: 'Loja atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({
      error: 'Erro ao atualizar loja'
    });
  }
});

// GESTÃO DE LOJAS - Deletar loja
router.delete('/admin/stores/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se loja existe
    const store = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    if (store.length === 0) {
      return res.status(404).json({
        error: 'Loja não encontrada'
      });
    }

    // Deletar loja (cascade irá remover usuários, clientes, etc.)
    await db.delete(stores).where(eq(stores.id, id));

    res.json({
      message: 'Loja deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar loja:', error);
    res.status(500).json({
      error: 'Erro ao deletar loja'
    });
  }
});

// GESTÃO DE LEADS
router.get('/admin/leads', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
    res.json(allLeads);
  } catch (error) {
    console.error('Erro ao listar leads:', error);
    res.status(500).json({
      error: 'Erro ao carregar leads'
    });
  }
});

router.post('/leads', validateBody(createLeadSchema), async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Salvar lead no banco de dados
    await db.insert(leads).values({
      id: generateId(),
      name,
      email,
      phone: phone || null,
      company: company || null,
      message: message || null,
      status: 'new',
      source: 'website'
    });

    // Tentar enviar email de notificação (não bloquear se falhar)
    try {
      await emailService.sendLeadNotification({
        name,
        email,
        phone,
        company,
        message
      });
    } catch (emailError) {
      console.error('Failed to send lead notification email:', emailError);
      // Continuar mesmo se o email falhar
    }

    res.status(201).json({
      message: 'Lead capturado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao capturar lead:', error);
    res.status(500).json({
      error: 'Erro ao processar solicitação'
    });
  }
});

// DASHBOARD LOJISTA
router.get('/store/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Buscar informações da loja
    const store = await db.select().from(stores).where(eq(stores.id, user.storeId)).limit(1);
    
    if (store.length === 0) {
      return res.status(404).json({
        error: 'Loja não encontrada'
      });
    }

    // Estatísticas da loja
    const customerCount = await db.select({ count: count() }).from(customers).where(eq(customers.storeId, user.storeId));
    const activeRewards = await db.select({ count: count() }).from(rewards).where(and(eq(rewards.storeId, user.storeId), eq(rewards.isActive, true)));
    const monthlyRedemptions = await db.select({ count: count() }).from(rewardRedemptions).where(
      and(
        eq(rewardRedemptions.storeId, user.storeId),
        sql`DATE_TRUNC('month', ${rewardRedemptions.redeemedAt}) = DATE_TRUNC('month', CURRENT_DATE)`
      )
    );
    
    // Pontos em circulação
    const totalPoints = await db.select({ 
      total: sql<number>`COALESCE(SUM(${customers.totalPoints}), 0)` 
    }).from(customers).where(eq(customers.storeId, user.storeId));

    res.json({
      store: store[0],
      stats: {
        totalCustomers: customerCount[0].count,
        activeRewards: activeRewards[0].count,
        monthlyRedemptions: monthlyRedemptions[0].count,
        totalPointsInCirculation: totalPoints[0].total
      }
    });

  } catch (error) {
    console.error('Erro no dashboard da loja:', error);
    res.status(500).json({
      error: 'Erro ao carregar dashboard'
    });
  }
});

// GESTÃO DE CLIENTES
router.get('/store/customers', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    
    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    const storeCustomers = await db.select().from(customers)
      .where(eq(customers.storeId, user.storeId))
      .orderBy(desc(customers.createdAt));

    res.json(storeCustomers);

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      error: 'Erro ao carregar clientes'
    });
  }
});

router.post('/store/customers', authenticateToken, validateBody(createCustomerSchema), async (req, res) => {
  try {
    const user = req.user!;
    const { name, email, phone } = req.body;

    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Nome é obrigatório'
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        error: 'Email ou telefone são obrigatórios'
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Verificar se cliente já existe na loja
    if (email) {
      const existingCustomer = await db.select().from(customers)
        .where(and(eq(customers.storeId, user.storeId), eq(customers.email, email)))
        .limit(1);
      
      if (existingCustomer.length > 0) {
        return res.status(400).json({
          error: 'Cliente com este email já cadastrado'
        });
      }
    }

    const customerId = generateId();
    await db.insert(customers).values({
      id: customerId,
      storeId: user.storeId,
      name,
      email: email || null,
      phone: phone || null,
      totalPoints: 0,
      isActive: true
    });

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso',
      customerId
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro ao cadastrar cliente'
    });
  }
});

// GESTÃO DE PONTOS
router.post('/store/customers/:customerId/points', authenticateToken, validateBody(pointsTransactionSchema), async (req, res) => {
  try {
    const user = req.user!;
    const { customerId } = req.params;
    const { points, description, type = 'earned' } = req.body;

    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    if (!points || points <= 0) {
      return res.status(400).json({
        error: 'Quantidade de pontos deve ser maior que zero'
      });
    }

    // Verificar se cliente pertence à loja
    const customer = await db.select().from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.storeId, user.storeId)))
      .limit(1);

    if (customer.length === 0) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }

    // Criar transação
    await db.insert(pointsTransactions).values({
      id: generateId(),
      customerId,
      storeId: user.storeId,
      type: type as 'earned' | 'redeemed' | 'adjusted',
      points: type === 'redeemed' ? -points : points,
      description: description || `Pontos ${type === 'redeemed' ? 'resgatados' : 'adicionados'}`,
      createdBy: user.id
    });

    // Atualizar total de pontos do cliente
    const newTotal = type === 'redeemed' 
      ? customer[0].totalPoints - points
      : customer[0].totalPoints + points;

    await db.update(customers)
      .set({ totalPoints: Math.max(0, newTotal), updatedAt: new Date() })
      .where(eq(customers.id, customerId));

    res.json({
      message: 'Pontos atualizados com sucesso',
      newTotal: Math.max(0, newTotal)
    });

  } catch (error) {
    console.error('Erro ao atualizar pontos:', error);
    res.status(500).json({
      error: 'Erro ao processar pontos'
    });
  }
});

// VALIDAÇÃO DE RESGATES
router.post('/store/validate-redemption', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;
    const { code } = req.body;

    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    if (!code) {
      return res.status(400).json({
        error: 'Código é obrigatório'
      });
    }

    // Buscar resgate pelo código nas notas
    const redemption = await db.select({
      id: rewardRedemptions.id,
      customerId: rewardRedemptions.customerId,
      storeId: rewardRedemptions.storeId,
      rewardId: rewardRedemptions.rewardId,
      pointsUsed: rewardRedemptions.pointsUsed,
      status: rewardRedemptions.status,
      redeemedAt: rewardRedemptions.redeemedAt,
      notes: rewardRedemptions.notes,
      customerName: customers.name,
      rewardName: rewards.name,
      rewardDescription: rewards.description
    })
    .from(rewardRedemptions)
    .innerJoin(customers, eq(rewardRedemptions.customerId, customers.id))
    .innerJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
    .where(and(
      eq(rewardRedemptions.storeId, user.storeId),
      sql`${rewardRedemptions.notes} LIKE ${'%' + code + '%'}`
    ))
    .limit(1);

    if (redemption.length === 0) {
      return res.status(404).json({
        error: 'Código de resgate não encontrado ou inválido'
      });
    }

    const redemptionData = redemption[0];

    if (redemptionData.status === 'completed') {
      return res.status(400).json({
        error: 'Este código já foi utilizado',
        usedAt: redemptionData.redeemedAt
      });
    }

    if (redemptionData.status === 'cancelled') {
      return res.status(400).json({
        error: 'Este código foi cancelado'
      });
    }

    // Marcar resgate como utilizado
    await db.update(rewardRedemptions)
      .set({ 
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(rewardRedemptions.id, redemptionData.id));

    res.json({
      success: true,
      message: 'Código validado e resgate confirmado!',
      redemption: {
        id: redemptionData.id,
        code: code,
        customer: redemptionData.customerName,
        reward: redemptionData.rewardName,
        description: redemptionData.rewardDescription,
        pointsUsed: redemptionData.pointsUsed,
        redeemedAt: redemptionData.redeemedAt,
        completedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao validar resgate:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GESTÃO DE RECOMPENSAS
router.get('/store/rewards', authenticateToken, async (req, res) => {
  try {
    const user = req.user!;

    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    const storeRewards = await db.select().from(rewards)
      .where(eq(rewards.storeId, user.storeId))
      .orderBy(desc(rewards.createdAt));

    res.json(storeRewards);

  } catch (error) {
    console.error('Erro ao listar recompensas:', error);
    res.status(500).json({
      error: 'Erro ao carregar recompensas'
    });
  }
});

router.post('/store/rewards', authenticateToken, validateBody(createRewardSchema), async (req, res) => {
  try {
    const user = req.user!;
    const { 
      name, 
      description, 
      pointsRequired, 
      category,
      rewardType,
      rewardValue,
      maxRedemptions,
      validUntil,
      neverExpires,
      minimumPurchase,
      termsAndConditions 
    } = req.body;

    if (user.role !== 'store_owner' || !user.storeId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    if (!name || !pointsRequired || pointsRequired <= 0) {
      return res.status(400).json({
        error: 'Nome e pontos necessários são obrigatórios'
      });
    }

    // Processar data de validade
    let validUntilDate = null;
    if (!neverExpires && validUntil) {
      validUntilDate = new Date(validUntil);
      if (validUntilDate <= new Date()) {
        return res.status(400).json({
          error: 'Data de validade deve ser futura'
        });
      }
    }

    const rewardId = generateId();
    await db.insert(rewards).values({
      id: rewardId,
      storeId: user.storeId,
      name,
      description: description || null,
      pointsRequired: parseInt(pointsRequired),
      category: category || 'other',
      rewardType: rewardType || 'voucher',
      rewardValue: rewardValue || null,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
      currentRedemptions: 0,
      validFrom: new Date(),
      validUntil: validUntilDate,
      neverExpires: neverExpires || false,
      minimumPurchase: minimumPurchase ? parseInt(minimumPurchase) : null,
      termsAndConditions: termsAndConditions || null,
      isActive: true
    });

    res.status(201).json({
      message: 'Recompensa criada com sucesso',
      rewardId
    });

  } catch (error) {
    console.error('Erro ao criar recompensa:', error);
    res.status(500).json({
      error: 'Erro ao criar recompensa'
    });
  }
});

// API PÚBLICA - Informações da loja (para clientes)
router.get('/public/store/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const store = await db.select({
      id: stores.id,
      name: stores.name,
      slug: stores.slug,
      customUrl: stores.customUrl,
      isActive: stores.isActive,
      pointsConversionRate: stores.pointsConversionRate
    }).from(stores).where(eq(stores.slug, slug)).limit(1);

    if (store.length === 0) {
      return res.status(404).json({
        error: 'Loja não encontrada'
      });
    }

    if (!store[0].isActive) {
      return res.status(403).json({
        error: 'Loja temporariamente indisponível'
      });
    }

    res.json(store[0]);

  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    res.status(500).json({
      error: 'Erro ao carregar loja'
    });
  }
});

// API ADMIN - Obter credenciais de loja
router.get('/admin/stores/:id/credentials', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar loja e usuário lojista
    const storeData = await db.select({
      storeId: stores.id,
      storeName: stores.name,
      storeSlug: stores.slug,
      ownerEmail: stores.ownerEmail,
      customUrl: stores.customUrl,
      userId: users.id,
      userName: users.name,
      userEmail: users.email
    }).from(stores)
    .leftJoin(users, eq(users.storeId, stores.id))
    .where(eq(stores.id, id))
    .limit(1);

    if (storeData.length === 0) {
      return res.status(404).json({
        error: 'Loja não encontrada'
      });
    }

    const store = storeData[0];

    res.json({
      store: {
        name: store.storeName,
        slug: store.storeSlug,
        email: store.ownerEmail,
        customUrl: store.customUrl
      },
      loginCredentials: {
        email: store.userEmail,
        dashboardUrl: '/dashboard'
      },
      note: 'O lojista deve fazer login com o email cadastrado e a senha que foi enviada por email.'
    });

  } catch (error) {
    console.error('Erro ao buscar credenciais:', error);
    res.status(500).json({
      error: 'Erro ao carregar credenciais'
    });
  }
});

// API ADMIN - Impersonar lojista (fazer login como lojista)
router.post('/admin/stores/:id/impersonate', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar lojista da loja
    const storeOwner = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      storeId: users.storeId,
      isActive: users.isActive
    }).from(users)
    .where(and(eq(users.storeId, id), eq(users.role, 'store_owner')))
    .limit(1);

    if (storeOwner.length === 0) {
      return res.status(404).json({
        error: 'Lojista não encontrado'
      });
    }

    if (!storeOwner[0].isActive) {
      return res.status(403).json({
        error: 'Usuário lojista está inativo'
      });
    }

    // Gerar token para o lojista
    const token = generateToken({
      userId: storeOwner[0].id,
      email: storeOwner[0].email,
      role: storeOwner[0].role,
      storeId: storeOwner[0].storeId
    });

    res.json({
      message: 'Login como lojista realizado com sucesso',
      token,
      user: {
        id: storeOwner[0].id,
        email: storeOwner[0].email,
        name: storeOwner[0].name,
        role: storeOwner[0].role,
        storeId: storeOwner[0].storeId
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login como lojista:', error);
    res.status(500).json({
      error: 'Erro ao processar solicitação'
    });
  }
});

// API ADMIN - Redefinir senha de lojista
router.post('/admin/stores/:id/reset-password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar lojista da loja
    const storeOwner = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      storeId: users.storeId
    }).from(users)
    .where(and(eq(users.storeId, id), eq(users.role, 'store_owner')))
    .limit(1);

    if (storeOwner.length === 0) {
      return res.status(404).json({
        error: 'Lojista não encontrado'
      });
    }

    // Gerar nova senha
    const newPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha no banco
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, storeOwner[0].id));

    console.log(`🔄 Senha redefinida para lojista: ${storeOwner[0].email}`);
    console.log(`🔑 Nova senha: ${newPassword}`);

    res.json({
      message: 'Senha redefinida com sucesso',
      credentials: {
        email: storeOwner[0].email,
        password: newPassword,
        note: 'Nova senha gerada. Lojista deve usar essas credenciais para fazer login.'
      }
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      error: 'Erro ao redefinir senha'
    });
  }
});

// API PÚBLICA - Login de cliente
router.post('/public/customer-login', validateBody(customerLoginSchema), async (req, res) => {
  try {
    const { storeSlug, email, phone } = req.body;

    if (!storeSlug) {
      return res.status(400).json({
        error: 'Loja não especificada'
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        error: 'Email ou telefone são obrigatórios'
      });
    }

    // Buscar loja
    const store = await db.select().from(stores).where(eq(stores.slug, storeSlug)).limit(1);
    if (store.length === 0 || !store[0].isActive) {
      return res.status(404).json({
        error: 'Loja não encontrada ou inativa'
      });
    }

    // Buscar ou criar cliente
    let customer;
    if (email) {
      customer = await db.select().from(customers)
        .where(and(eq(customers.storeId, store[0].id), eq(customers.email, email)))
        .limit(1);
    } else {
      customer = await db.select().from(customers)
        .where(and(eq(customers.storeId, store[0].id), eq(customers.phone, phone)))
        .limit(1);
    }

    if (customer.length === 0) {
      // Criar novo cliente
      const customerId = generateId();
      await db.insert(customers).values({
        id: customerId,
        storeId: store[0].id,
        name: 'Cliente', // Nome padrão, pode ser atualizado depois
        email: email || null,
        phone: phone || null,
        totalPoints: 0,
        isActive: true
      });

      customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    }

    res.json({
      customer: customer[0],
      store: {
        name: store[0].name,
        slug: store[0].slug
      }
    });

  } catch (error) {
    console.error('Erro no login do cliente:', error);
    res.status(500).json({
      error: 'Erro no login'
    });
  }
});

// API PÚBLICA - Recompensas da loja
router.get('/public/store/:slug/rewards', async (req, res) => {
  try {
    const { slug } = req.params;

    // Buscar loja
    const store = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
    if (store.length === 0 || !store[0].isActive) {
      return res.status(404).json({
        error: 'Loja não encontrada'
      });
    }

    // Buscar recompensas ativas
    const storeRewards = await db.select().from(rewards)
      .where(and(eq(rewards.storeId, store[0].id), eq(rewards.isActive, true)))
      .orderBy(rewards.pointsRequired);

    res.json(storeRewards);

  } catch (error) {
    console.error('Erro ao listar recompensas:', error);
    res.status(500).json({
      error: 'Erro ao carregar recompensas'
    });
  }
});

// API PÚBLICA - Resgatar recompensa
router.post('/public/customer/:customerId/redeem/:rewardId', async (req, res) => {
  try {
    const { customerId, rewardId } = req.params;

    // Verificar se cliente existe
    const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar se recompensa existe e está ativa
    const reward = await db.select().from(rewards)
      .where(and(eq(rewards.id, rewardId), eq(rewards.isActive, true)))
      .limit(1);
    
    if (reward.length === 0) {
      return res.status(404).json({ error: 'Recompensa não encontrada' });
    }

    const rewardData = reward[0];
    const customerData = customer[0];

    // Verificar se cliente tem pontos suficientes
    if (customerData.totalPoints < rewardData.pointsRequired) {
      return res.status(400).json({ 
        error: 'Pontos insuficientes',
        required: rewardData.pointsRequired,
        available: customerData.totalPoints
      });
    }

    // Verificar limite de resgates
    if (rewardData.maxRedemptions !== null && rewardData.currentRedemptions >= rewardData.maxRedemptions) {
      return res.status(400).json({ error: 'Limite de resgates atingido para esta recompensa' });
    }

    // Verificar se cliente já tem resgate pendente da mesma recompensa (evita duplicatas)
    const pendingRedemption = await db.select().from(rewardRedemptions)
      .where(and(
        eq(rewardRedemptions.customerId, customerId),
        eq(rewardRedemptions.rewardId, rewardId),
        eq(rewardRedemptions.status, 'pending')
      ))
      .limit(1);

    if (pendingRedemption.length > 0) {
      return res.status(400).json({ 
        error: 'Você já possui um resgate pendente desta recompensa. Utilize-o antes de resgatar novamente.' 
      });
    }

    // Verificar validade da recompensa
    if (rewardData.validUntil && new Date(rewardData.validUntil) < new Date()) {
      return res.status(400).json({ error: 'Esta recompensa expirou' });
    }

    // Gerar código único para o resgate
    const redemptionCode = `${rewardData.category.toUpperCase()}-${generateId().slice(-6).toUpperCase()}`;
    
    // Criar resgate
    const redemptionId = generateId();
    await db.insert(rewardRedemptions).values({
      id: redemptionId,
      customerId,
      storeId: customerData.storeId,
      rewardId,
      pointsUsed: rewardData.pointsRequired,
      status: 'pending',
      notes: `Código: ${redemptionCode}`
    });

    // Debitar pontos do cliente
    await db.update(customers)
      .set({ 
        totalPoints: customerData.totalPoints - rewardData.pointsRequired,
        updatedAt: new Date()
      })
      .where(eq(customers.id, customerId));

    // Registrar transação de pontos
    await db.insert(pointsTransactions).values({
      id: generateId(),
      customerId,
      storeId: customerData.storeId,
      type: 'redeemed',
      points: -rewardData.pointsRequired,
      description: `Resgate: ${rewardData.name}`,
      referenceId: redemptionId
    });

    // Atualizar contador de resgates da recompensa
    await db.update(rewards)
      .set({ 
        currentRedemptions: rewardData.currentRedemptions + 1,
        updatedAt: new Date()
      })
      .where(eq(rewards.id, rewardId));

    res.json({
      message: 'Recompensa resgatada com sucesso!',
      redemption: {
        id: redemptionId,
        code: redemptionCode,
        reward: rewardData.name,
        pointsUsed: rewardData.pointsRequired,
        status: 'pending',
        instructions: 'Apresente este código na loja para utilizar sua recompensa.'
      },
      newBalance: customerData.totalPoints - rewardData.pointsRequired
    });

  } catch (error) {
    console.error('Erro ao resgatar recompensa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API PÚBLICA - Histórico de resgates do cliente
router.get('/public/customer/:customerId/redemptions', async (req, res) => {
  try {
    const { customerId } = req.params;

    const redemptions = await db.select({
      id: rewardRedemptions.id,
      rewardName: rewards.name,
      pointsUsed: rewardRedemptions.pointsUsed,
      status: rewardRedemptions.status,
      redeemedAt: rewardRedemptions.redeemedAt,
      completedAt: rewardRedemptions.completedAt,
      notes: rewardRedemptions.notes
    })
    .from(rewardRedemptions)
    .innerJoin(rewards, eq(rewardRedemptions.rewardId, rewards.id))
    .where(eq(rewardRedemptions.customerId, customerId))
    .orderBy(desc(rewardRedemptions.redeemedAt))
    .limit(50);

    res.json(redemptions);

  } catch (error) {
    console.error('Erro ao buscar resgates:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API PÚBLICA - Histórico de pontos do cliente
router.get('/public/customer/:customerId/transactions', async (req, res) => {
  try {
    const { customerId } = req.params;

    const transactions = await db.select({
      id: pointsTransactions.id,
      type: pointsTransactions.type,
      points: pointsTransactions.points,
      description: pointsTransactions.description,
      createdAt: pointsTransactions.createdAt
    }).from(pointsTransactions)
      .where(eq(pointsTransactions.customerId, customerId))
      .orderBy(desc(pointsTransactions.createdAt))
      .limit(50);

    res.json(transactions);

  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      error: 'Erro ao carregar histórico'
    });
  }
});

export default router;
