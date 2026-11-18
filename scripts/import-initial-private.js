import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from '../server/db.js';
import { uploadPrivateObject, verifyStoredObject } from '../server/storage.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'public', 'index.html');
const pdfPath = path.join(root, 'public', 'assets', 'Lebenslauf.pdf');
const importKey = 'initial-private-profile-and-cv-v1';

function elementBlock(source, tagName, startAt) {
  const tokenPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tokenPattern.lastIndex = startAt;
  let depth = 0;
  let first = -1;
  let match;
  while ((match = tokenPattern.exec(source))) {
    const closing = /^<\//.test(match[0]);
    if (!closing) {
      if (first < 0) first = match.index;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0 && first >= 0) return source.slice(first, tokenPattern.lastIndex);
    }
  }
  return null;
}

function decodeText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function attribute(tag, name) {
  const match = String(tag).match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] || '';
}

function readLegacyProfile(html) {
  const start = html.indexOf('<details class="private-details"');
  if (start < 0) throw new Error('Legacy private profile block not found');
  const block = elementBlock(html, 'details', start);
  if (!block) throw new Error('Legacy private profile block is malformed');
  let privatePhone = null;
  let privateEmail = null;
  for (const match of block.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
    const href = attribute(match[0].slice(0, match[0].indexOf('>') + 1), 'href');
    if (href.startsWith('tel:') && !privatePhone) privatePhone = decodeURIComponent(href.slice(4));
    if (href.startsWith('mailto:') && !privateEmail) privateEmail = decodeURIComponent(href.slice(7).split('?')[0]).toLowerCase();
  }
  const addressField = block.match(/<strong\b[^>]*data-i18n="privateAddressLabel"[^>]*>[\s\S]*?<\/strong>\s*<span\b[^>]*class="contact-value"[^>]*>([\s\S]*?)<\/span>/i);
  const address = decodeText(addressField?.[1]);
  const pieces = address.split(',').map((piece) => piece.trim()).filter(Boolean);
  const locality = pieces.at(-1)?.match(/^(\d{4,6})\s+(.+)$/);
  if (!privatePhone || !privateEmail || !pieces.length || !locality || pieces.length < 2) throw new Error('Legacy private profile is incomplete');
  return {
    private_phone: privatePhone,
    private_email: privateEmail,
    private_street: pieces.slice(0, -1).join(', ').slice(0, 255),
    private_zip: locality[1].slice(0, 32),
    private_city: locality[2].slice(0, 191),
    country: null
  };
}

async function main() {
  const pool = getPool();
  try {
    const [completed] = await pool.execute('SELECT import_key FROM data_imports WHERE import_key = ? LIMIT 1', [importKey]);
    if (completed.length) {
      console.log('Initial private import was already completed.');
      return;
    }

    const html = await fs.readFile(htmlPath, 'utf8');
    const profile = readLegacyProfile(html);
    const [admins] = await pool.execute(
      `SELECT u.id FROM app_users u JOIN access_allowlist a ON a.email = u.email
        WHERE a.role = 'admin' AND a.enabled = 1 ORDER BY u.id LIMIT 1`
    );
    const admin = admins[0];
    if (!admin) throw new Error('Initial admin record is unavailable');

    const pdf = await fs.readFile(pdfPath);
    if (pdf.length < 8 || pdf.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('Initial PDF is invalid');
    const [existingDocuments] = await pool.execute(
      'SELECT id FROM private_documents WHERE filename = ? AND deleted_at IS NULL LIMIT 1',
      ['Lebenslauf.pdf']
    );
    if (!existingDocuments.length) {
      const id = crypto.randomUUID();
      const objectKey = `private-documents/initial-${crypto.randomBytes(20).toString('hex')}-${id}.pdf`;
      await uploadPrivateObject(objectKey, pdf, 'application/pdf');
      await verifyStoredObject(objectKey, pdf);
      await pool.execute(
        `INSERT INTO private_documents (id, object_key, filename, mime_type, size_bytes, visible_to_users, created_by)
         VALUES (?, ?, ?, 'application/pdf', ?, 1, ?)`,
        [id, objectKey, 'Lebenslauf.pdf', pdf.length, admin.id]
      );
    }

    await pool.execute(
      `INSERT INTO private_profiles (user_id, private_phone, private_email, private_street, private_zip, private_city, country)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE private_phone = VALUES(private_phone), private_email = VALUES(private_email),
         private_street = VALUES(private_street), private_zip = VALUES(private_zip), private_city = VALUES(private_city), country = VALUES(country)`,
      [admin.id, profile.private_phone, profile.private_email, profile.private_street, profile.private_zip, profile.private_city, profile.country]
    );
    await pool.execute('INSERT INTO data_imports (import_key) VALUES (?)', [importKey]);
    const digest = crypto.createHash('sha256').update(pdf).digest('hex');
    if (!/^[a-f0-9]{64}$/.test(digest)) throw new Error('PDF integrity check failed');
    console.log('Initial private profile imported and the private PDF transfer was verified.');
  } finally {
    await closePool();
  }
}

main().catch(async (error) => {
  console.error('Initial private import failed:', error?.code || error?.name || 'unknown error');
  await closePool().catch(() => {});
  process.exitCode = 1;
});
