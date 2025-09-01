import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Estende o tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'super_admin' | 'store_owner';
        storeId?: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'super_admin' | 'store_owner';
    storeId?: string;
  };
}

// Middleware de autenticação JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso requerido',
      code: 'TOKEN_REQUIRED'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ 
      error: 'Configuração do servidor inválida',
      code: 'JWT_SECRET_MISSING'
    });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = decoded as any;
    next();
  });
};

// Middleware para verificar se é Super Admin
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Usuário não autenticado',
      code: 'UNAUTHENTICATED'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      error: 'Acesso restrito a Super Administradores',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

// Middleware para verificar se é Store Owner
export const requireStoreOwner = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Usuário não autenticado',
      code: 'UNAUTHENTICATED'
    });
  }

  if (req.user.role !== 'store_owner') {
    return res.status(403).json({ 
      error: 'Acesso restrito a proprietários de loja',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

// Middleware para verificar propriedade da loja
export const requireStoreAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Usuário não autenticado',
      code: 'UNAUTHENTICATED'
    });
  }

  // Super admin tem acesso a todas as lojas
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Store owner só tem acesso à própria loja
  const storeId = req.params.storeId || req.body.storeId || req.query.storeId;
  
  if (req.user.role === 'store_owner') {
    if (!req.user.storeId || req.user.storeId !== storeId) {
      return res.status(403).json({ 
        error: 'Acesso negado a esta loja',
        code: 'STORE_ACCESS_DENIED'
      });
    }
  }

  next();
};

// Gerar token JWT
export const generateToken = (payload: object): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(payload, jwtSecret, { 
    expiresIn: '24h',
    issuer: 'fidelizapontos-api'
  });
};
