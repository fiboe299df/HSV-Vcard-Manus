import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from './db.js';
import { registerAuthRoutes } from './auth.js';
import { registerAdminRoutes } from './admin.js';
import { getBundesligaData } from './matches.js';
import { setNoStore } from './security.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(root, 'public');
const requiredMigrations = ['001_private_area.sql', '002_initial_admin.sql'];
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '64kb', strict: true }));

registerAuthRoutes(app);
registerAdminRoutes(app);

app.get('/healthz', (_req, res) => {
  setNoStore(res);
  res.status(200).json({ ok: true });
});

app.get('/api/matches', async (_req, res) => {
  setNoStore(res);
  try {
    const data = await getBundesligaData();
    return res.json(data);
  } catch {
    return res.status(503).json({ error: 'matches_unavailable', message: 'Spielinformationen sind derzeit nicht verfügbar.' });
  }
});

app.use('/api', (_req, res) => {
  setNoStore(res);
  res.status(404).json({ error: 'not_found', message: 'Diese API-Adresse existiert nicht.' });
});

app.use(express.static(publicDirectory, {
  index: 'index.html',
  fallthrough: true,
  dotfiles: 'deny',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html') || filePath.endsWith('.json')) {
      res.setHeader('Cache-Control', 'no-cache, private');
    }
  }
}));

app.use((req, res) => {
  if (req.accepts('html')) return res.status(404).send('Seite nicht gefunden.');
  return res.status(404).json({ error: 'not_found' });
});

app.use((error, _req, res, _next) => {
  if (res.headersSent) return;
  const status = error?.code === 'LIMIT_FILE_SIZE' ? 413 : (error?.type === 'entity.too.large' ? 413 : 500);
  console.error('HTTP request failed:', error?.code || error?.name || 'unknown error');
  setNoStore(res);
  return res.status(status).json({
    error: status === 413 ? 'request_too_large' : 'request_failed',
    message: status === 413 ? 'Die Datei oder Anfrage ist zu groß.' : 'Die Anfrage konnte nicht verarbeitet werden.'
  });
});

async function assertDatabaseReady() {
  const pool = getPool();
  await pool.query('SELECT 1');
  const [rows] = await pool.query('SELECT migration_name FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.migration_name));
  const missing = requiredMigrations.filter((name) => !applied.has(name));
  if (missing.length) throw new Error('Database migrations are incomplete');
}

async function start() {
  await assertDatabaseReady();
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`HSV preview server listening on port ${port}`);
  });
  const shutdown = () => server.close(async () => {
    await closePool().catch(() => {});
    process.exit(0);
  });
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

start().catch(async (error) => {
  console.error('Application startup failed:', error?.code || error?.name || 'unknown error');
  await closePool().catch(() => {});
  process.exitCode = 1;
});
