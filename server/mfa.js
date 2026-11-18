import crypto from 'node:crypto';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

function encryptionKey() {
  const secret = process.env.APP_MFA_ENCRYPTION_KEY;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) throw new Error('MFA encryption secret is unavailable or too short');
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

export function encryptSeed(seed) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(seed, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSeed(ciphertext) {
  const [version, ivText, tagText, dataText] = String(ciphertext || '').split('.');
  if (version !== 'v1' || !ivText || !tagText || !dataText) throw new Error('Invalid encrypted MFA seed');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataText, 'base64url')), decipher.final()]).toString('utf8');
}

function totpFor(email, base32) {
  return new OTPAuth.TOTP({
    issuer: 'HSV Privatbereich',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ base32 })
  });
}

export async function createEnrollment(email) {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = totpFor(email, secret.base32);
  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri, { errorCorrectionLevel: 'M', margin: 2, width: 240 });
  return { base32: secret.base32, uri, qrDataUrl };
}

export function verifyTotp(base32, token) {
  if (!/^\d{6}$/.test(String(token || ''))) return false;
  return totpFor('account', base32).validate({ token: String(token), window: 1 }) !== null;
}

function normalizeRecoveryCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-F0-9]/g, '');
}

export function generateRecoveryCodes(count = 10) {
  return Array.from({ length: count }, () => crypto.randomBytes(10).toString('hex').toUpperCase().match(/.{1,5}/g).join('-'));
}

export function hashRecoveryCode(code) {
  const normalized = normalizeRecoveryCode(code);
  if (!/^[A-F0-9]{20}$/.test(normalized)) return null;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function matchRecoveryCode(candidate, hashes) {
  const target = hashRecoveryCode(candidate);
  if (!target || !Array.isArray(hashes)) return -1;
  const targetBytes = Buffer.from(target, 'hex');
  return hashes.findIndex((hash) => {
    if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) return false;
    return crypto.timingSafeEqual(targetBytes, Buffer.from(hash, 'hex'));
  });
}
