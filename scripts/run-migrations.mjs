import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

function loadEnvFromLocalFile() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.resolve(process.cwd(), 'local.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromLocalFile();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not configured');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../drizzle');

const pool = new Pool({ connectionString });
const db = drizzle(pool);

try {
  await migrate(db, { migrationsFolder: migrationsDir });
  console.log('Migrations complete');
} catch (error) {
  const isNetworkError =
    error?.cause?.code === 'ENETUNREACH' ||
    error?.cause?.code === 'ECONNREFUSED' ||
    error?.code === 'ENETUNREACH' ||
    error?.code === 'ECONNREFUSED';

  if (process.env.NODE_ENV === 'development' && isNetworkError) {
    console.warn('Database is unreachable. Skipping migrations in development mode.');
    process.exit(0);
  }

  console.error('Migration failed', error);
  process.exit(1);
} finally {
  await pool.end();
}
