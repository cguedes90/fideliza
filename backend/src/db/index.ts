import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

// Para ESM modules - garantir que dotenv seja carregado
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const connectionString = process.env.DATABASE_URL;

console.log('🔍 DATABASE_URL carregada:', !!connectionString);

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Configuração da conexão PostgreSQL
const sql = postgres(connectionString, {
  ssl: 'require',
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Instância do Drizzle ORM
export const db = drizzle(sql, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Conexão com o banco estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    return false;
  }
}

export { sql };
