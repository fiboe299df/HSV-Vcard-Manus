import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from '../server/db.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDirectory = path.join(root, 'public');
const scanExtensions = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg']);

function normalized(value) {
  return String(value || '').toLocaleLowerCase('en').replace(/[^a-z0-9]/g, '');
}

async function walk(directory, files = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath, files);
    else if (scanExtensions.has(path.extname(entry.name).toLowerCase())) files.push(fullPath);
  }
  return files;
}

async function main() {
  const pool = getPool();
  try {
    const [profiles] = await pool.execute(
      `SELECT private_phone, private_email, private_street, private_zip, private_city
         FROM private_profiles WHERE private_phone IS NOT NULL OR private_email IS NOT NULL
          OR private_street IS NOT NULL OR private_zip IS NOT NULL OR private_city IS NOT NULL`
    );
    const protectedValues = [];
    for (const profile of profiles) {
      if (profile.private_phone) protectedValues.push(profile.private_phone);
      if (profile.private_email) protectedValues.push(profile.private_email);
      const address = [profile.private_street, [profile.private_zip, profile.private_city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      if (address) protectedValues.push(address);
    }

    const files = await walk(publicDirectory);
    let leak = false;
    for (const file of files) {
      const relative = path.relative(root, file).replaceAll(path.sep, '/');
      if (/\/Lebenslauf\.pdf$/i.test(relative) || /\/lebenslauf-seite-\d+\.webp$/i.test(relative)) leak = true;
      const content = await fs.readFile(file, 'utf8');
      if (/FOOTBALL_DATA_API_KEY|APP_MFA_ENCRYPTION_KEY|CARD\.(?:privatePhone|privateEmail|privateStreet|privateZip|privateCity)|(?:TEL|EMAIL|ADR);TYPE=HOME/i.test(content)) leak = true;
      const compact = normalized(content);
      for (const value of protectedValues) {
        const needle = normalized(value);
        if (needle.length >= 7 && compact.includes(needle)) leak = true;
      }
    }
    if (leak) throw new Error('Privacy audit failed');
    console.log('Privacy audit passed: no tested private contact or PDF assets are present in public files.');
  } finally {
    await closePool();
  }
}

main().catch(async (error) => {
  console.error(error?.message === 'Privacy audit failed' ? error.message : 'Privacy audit could not complete.');
  await closePool().catch(() => {});
  process.exitCode = 1;
});
