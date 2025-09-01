import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Cache de conexão para Vercel Functions
let db: any = null;
let sql: any = null;

export function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Configuração da conexão PostgreSQL para Vercel
    sql = postgres(connectionString, {
      ssl: 'require',
      max: 1, // Limite de conexões para serverless
      idle_timeout: 20,
      connect_timeout: 10,
    });

    db = drizzle(sql, { schema });
  }
  
  return db;
}

export { sql };
