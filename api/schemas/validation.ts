import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

// Schema para criação de loja
export const createStoreSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido'),
  segment: z.string().min(1, 'Segmento é obrigatório').max(50, 'Segmento muito longo'),
  ownerEmail: z.string().email('Email inválido'),
  pointsConversionRate: z.string().regex(/^\d+\.?\d{0,2}$/, 'Taxa de conversão inválida').optional()
});

// Schema para atualização de loja
export const updateStoreSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido').optional(),
  segment: z.string().min(1, 'Segmento é obrigatório').max(50, 'Segmento muito longo').optional(),
  ownerEmail: z.string().email('Email inválido').optional(),
  pointsConversionRate: z.string().regex(/^\d+\.?\d{0,2}$/, 'Taxa de conversão inválida').optional(),
  isActive: z.boolean().optional()
});

// Schema para criação de cliente
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone inválido').optional().or(z.literal(''))
}).refine(data => data.email || data.phone, {
  message: 'Email ou telefone são obrigatórios',
  path: ['email']
});

// Schema para transação de pontos
export const pointsTransactionSchema = z.object({
  points: z.number().int().positive('Pontos devem ser positivos'),
  description: z.string().max(200, 'Descrição muito longa').optional(),
  type: z.enum(['earned', 'redeemed', 'adjusted']).default('earned')
});

// Schema para criação de recompensa
export const createRewardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  pointsRequired: z.number().int().positive('Pontos necessários devem ser positivos'),
  category: z.enum(['discount', 'product', 'service', 'cashback', 'other']).default('other'),
  rewardType: z.enum(['percentage', 'fixed_value', 'free_item', 'voucher']).default('voucher'),
  rewardValue: z.string().max(100, 'Valor muito longo').optional(),
  maxRedemptions: z.number().int().positive('Limite deve ser positivo').optional(),
  validUntil: z.string().datetime().optional(), // ISO string
  neverExpires: z.boolean().default(false),
  minimumPurchase: z.number().int().min(0, 'Valor mínimo não pode ser negativo').optional(),
  termsAndConditions: z.string().max(1000, 'Termos muito longos').optional()
});

// Schema para login de cliente
export const customerLoginSchema = z.object({
  storeSlug: z.string().min(1, 'Slug da loja é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone inválido').optional().or(z.literal(''))
}).refine(data => data.email || data.phone, {
  message: 'Email ou telefone são obrigatórios',
  path: ['email']
});

// Schema para criação de lead
export const createLeadSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone inválido').optional(),
  company: z.string().max(100, 'Nome da empresa muito longo').optional(),
  message: z.string().max(1000, 'Mensagem muito longa').optional()
});

// Middleware para validação
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};