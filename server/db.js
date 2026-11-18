import mysql from 'mysql2/promise';

let pool;

function buildPoolConfig() {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error('DATABASE_URL is unavailable');
  const url = new URL(dsn);
  if (url.protocol !== 'mysql:') throw new Error('Managed database must use the mysql protocol');
  const sslRequested = url.searchParams.has('ssl');
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    charset: 'utf8mb4',
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 50,
    enableKeepAlive: true,
    ssl: sslRequested ? {} : undefined
  };
}

export function getPool() {
  if (!pool) pool = mysql.createPool(buildPoolConfig());
  return pool;
}

export async function closePool() {
  if (pool) {
    const active = pool;
    pool = undefined;
    await active.end();
  }
}
