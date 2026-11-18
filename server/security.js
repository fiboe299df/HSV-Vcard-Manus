import crypto from 'node:crypto';

export const APP_SESSION_COOKIE = 'webdev_app_session';
export const OAUTH_STATE_COOKIE = 'hsv_oauth_state';

export function parseCookies(header = '') {
  const result = Object.create(null);
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name) result[name] = value;
  }
  return result;
}

export function getCookie(req, name) {
  return parseCookies(req.headers.cookie || '')[name] || null;
}

export function setCookie(res, name, value, { maxAgeSeconds, path = '/', httpOnly = true, secure = true } = {}) {
  const attributes = [
    `${name}=${value}`,
    `Path=${path}`,
    ...(secure ? ['Secure', 'SameSite=None'] : ['SameSite=Lax'])
  ];
  if (httpOnly) attributes.push('HttpOnly');
  if (Number.isFinite(maxAgeSeconds)) attributes.push(`Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`);
  res.append('Set-Cookie', attributes.join('; '));
}

export function clearCookie(res, name, path = '/', secure = true) {
  setCookie(res, name, '', { maxAgeSeconds: 0, path, secure });
}

export function sessionHash(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function randomSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function isTrustedOrigin(value) {
  if (typeof value !== 'string' || value.length > 512) return false;
  let origin;
  try { origin = new URL(value); } catch { return false; }
  if (origin.origin !== value || origin.username || origin.password) return false;
  const host = origin.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') return origin.protocol === 'http:' || origin.protocol === 'https:';
  return origin.protocol === 'https:' && (host.endsWith('.manus.computer') || host.endsWith('.manus.com'));
}

export function requestOrigin(req) {
  const origin = req.get('Origin');
  return isTrustedOrigin(origin) ? origin : null;
}

export function verifyPlatformJwt(token) {
  if (typeof token !== 'string' || token.length > 8192) return null;
  const secret = process.env.MANUS_JWT_SECRET;
  const projectId = process.env.MANUS_PROJECT_ID;
  if (!secret || !projectId) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch { return null; }
  if (header?.alg !== 'HS256' || payload?.appId !== projectId) return null;
  const expiry = Number(payload.exp);
  if (!Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000)) return null;
  const signature = Buffer.from(parts[2], 'base64url');
  const expected = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
  if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) return null;
  const openId = payload.openId || payload.open_id;
  if (typeof openId !== 'string' || !openId || openId.length > 191) return null;
  return { openId, expiresAt: new Date(expiry * 1000) };
}

export function setNoStore(res) {
  res.set('Cache-Control', 'no-store, private, max-age=0');
  res.set('Pragma', 'no-cache');
}

export function setAppSessionCookie(res, token, persistent = false, secure = true) {
  setCookie(res, APP_SESSION_COOKIE, token, {
    maxAgeSeconds: persistent ? 60 * 60 * 24 * 30 : undefined,
    path: '/',
    httpOnly: true,
    secure
  });
}
