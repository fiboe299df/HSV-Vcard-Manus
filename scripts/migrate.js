import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from '../server/db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (migration_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    const directory = path.join(root, 'db', 'migrations');
    const files = (await fs.readdir(directory)).filter((name) => /^\d+_[a-z0-9_-]+\.sql$/i.test(name)).sort();
    for (const name of files) {
      const [rows] = await connection.execute('SELECT migration_name FROM schema_migrations WHERE migration_name = ?', [name]);
      if (rows.length) {
        console.log(`migration already applied: ${name}`);
        continue;
      }
      const content = await fs.readFile(path.join(directory, name), 'utf8');
      const statements = content.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
      for (const statement of statements) await connection.query(statement);
      await connection.execute('INSERT INTO schema_migrations (migration_name) VALUES (?)', [name]);
      console.log(`migration applied: ${name}`);
    }
  } finally {
    connection.release();
    await closePool();
  }
}

main().catch(async (error) => {
  console.error('Migration failed:', error?.code || error?.name || 'unknown error');
  await closePool().catch(() => {});
  process.exitCode = 1;
});
