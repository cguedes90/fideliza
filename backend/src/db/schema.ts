import { pgTable, text, integer, timestamp, boolean, decimal, uuid, jsonb } from 'drizzle-orm/pg-core';

// Tabela de usuários (Super Admin e Store Owners)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['super_admin', 'store_owner'] }).notNull(),
  storeId: text('store_id').references(() => stores.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de lojas
export const stores = pgTable('stores', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  cnpj: text('cnpj').notNull().unique(),
  segment: text('segment').notNull(),
  pointsConversionRate: decimal('points_conversion_rate', { precision: 10, scale: 2 }).default('1.00'),
  ownerEmail: text('owner_email').notNull(),
  isActive: boolean('is_active').default(true),
  qrCode: text('qr_code'),
  customUrl: text('custom_url'),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de clientes das lojas
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  totalPoints: integer('total_points').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de transações de pontos
export const pointsTransactions = pgTable('points_transactions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['earned', 'redeemed', 'expired', 'adjusted'] }).notNull(),
  points: integer('points').notNull(),
  description: text('description'),
  referenceId: text('reference_id'), // ID da recompensa resgatada, se aplicável
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de recompensas
export const rewards = pgTable('rewards', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  pointsRequired: integer('points_required').notNull(),
  category: text('category', { enum: ['discount', 'product', 'service', 'cashback', 'other'] }).default('other'),
  rewardType: text('reward_type', { enum: ['percentage', 'fixed_value', 'free_item', 'voucher'] }).default('voucher'),
  rewardValue: text('reward_value'), // Ex: "10%" ou "R$ 25,00" ou "Produto X"
  maxRedemptions: integer('max_redemptions'), // Limite de resgates (null = ilimitado)
  currentRedemptions: integer('current_redemptions').default(0), // Contador de resgates
  validFrom: timestamp('valid_from').defaultNow(),
  validUntil: timestamp('valid_until'), // null = nunca expira
  neverExpires: boolean('never_expires').default(false),
  minimumPurchase: integer('minimum_purchase'), // Valor mínimo de compra em centavos
  termsAndConditions: text('terms_and_conditions'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de resgates de recompensas
export const rewardRedemptions = pgTable('reward_redemptions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  storeId: text('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  rewardId: text('reward_id').notNull().references(() => rewards.id, { onDelete: 'cascade' }),
  pointsUsed: integer('points_used').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'cancelled'] }).default('pending'),
  redeemedAt: timestamp('redeemed_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
});

// Tabela de leads capturados
export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  message: text('message'),
  status: text('status', { enum: ['new', 'contacted', 'converted', 'lost'] }).default('new'),
  source: text('source').default('website'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tipos TypeScript inferidos
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
export type NewPointsTransaction = typeof pointsTransactions.$inferInsert;
export type Reward = typeof rewards.$inferSelect;
export type NewReward = typeof rewards.$inferInsert;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type NewRewardRedemption = typeof rewardRedemptions.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
