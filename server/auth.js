import crypto from 'node:crypto';
import {
  APP_SESSION_COOKIE, OAUTH_STATE_COOKIE, clearCookie, getCookie, isTrustedOrigin,
  randomSessionToken, requestOrigin, safeEqual, sessionHash, setAppSessionCookie,
  setCookie, setNoStore, verifyPlatformJwt
} from './security.js';
import { getPool } from './db.js';
import {
  createEnrollment, decryptSeed, encryptSeed, generateRecoveryCodes,
  hashRecoveryCode, matchRecoveryCode, verifyTotp
} from './mfa.js';

const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
const stateTtlSeconds = 5 * 60;
const startAttempts = new Map();

function clientAddress(req) {
  return String(req.ip || 'unknown').slice(0, 100);
}

function withinRateLimit(map, key, limit, windowMs) {
  const now = Date.now();
  const slot = map.get(key);
  if (!slot || now - slot.start >= windowMs) {
    map.set(key, { start: now, count: 1 });
    return true;
  }
  slot.count += 1;
  return slot.count <= limit;
}

function originFromRequest(req) {
  const origin = requestOrigin(req);
  if (origin) return origin;
  const referer = req.get('Referer');
  try {
    const parsed = new URL(referer);
    return isTrustedOrigin(parsed.origin) ? parsed.origin : null;
  } catch { return null; }
}

function sendAuthError(res, status, code, message) {
  setNoStore(res);
  return res.status(status).json({ error: code, message });
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function validCallbackUri(value) {
  try {
    const parsed = new URL(value);
    const origin = parsed.origin;
    return isTrustedOrigin(origin) && parsed.pathname === '/api/auth/callback' && !parsed.search && !parsed.hash;
  } catch { return false; }
}

function oauthStateCookie(req) {
  return getCookie(req, OAUTH_STATE_COOKIE);
}

async function exchangeCode(code, redirectUri) {
  const base = process.env.MANUS_OAUTH_API_URL?.replace(/\/+$/, '');
  const clientId = process.env.MANUS_PROJECT_ID;
  if (!base || !clientId) throw new Error('Manus OAuth configuration unavailable');
  const response = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ clientId, grantType: 'authorization_code', code, redirectUri }),
    signal: AbortSignal.timeout(15000)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.accessToken !== 'string' || !body.accessToken) throw new Error(`OAuth exchange failed (${response.status})`);
  return body.accessToken;
}

async function getManusIdentity(accessToken) {
  const base = process.env.MANUS_OAUTH_API_URL?.replace(/\/+$/, '');
  const response = await fetch(`${base}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ accessToken }),
    signal: AbortSignal.timeout(15000)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.openId !== 'string' || !body.openId || typeof body.email !== 'string') throw new Error(`OAuth identity lookup failed (${response.status})`);
  const email = normalizeEmail(body.email);
  if (!email) throw new Error('OAuth identity did not contain a valid email');
  return { openId: body.openId, email, name: String(body.name || '').trim().slice(0, 191) || null };
}

async function findSessionByHash(tokenHash) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT s.token_hash, s.user_id, s.origin, s.mfa_verified_at, s.created_at, s.last_activity_at, s.expires_at,
            u.open_id, u.email, u.display_name, a.role, a.enabled AS allow_enabled,
            a.mfa_required, m.enabled AS mfa_enabled,
            COALESCE(JSON_LENGTH(m.recovery_hashes), 0) AS recovery_count
       FROM app_sessions s
       JOIN app_users u ON u.id = s.user_id
       JOIN access_allowlist a ON a.email = u.email
       LEFT JOIN user_mfa m ON m.user_id = u.id
      WHERE s.token_hash = ? AND a.enabled = 1
      LIMIT 1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function createPreviewSession(req, rawToken, claims) {
  const pool = getPool();
  const [users] = await pool.execute(
    `SELECT u.id, u.email, a.mfa_required, a.enabled, m.enabled AS mfa_enabled
       FROM app_users u
       JOIN access_allowlist a ON a.email = u.email
       LEFT JOIN user_mfa m ON m.user_id = u.id
      WHERE u.open_id = ? AND a.enabled = 1
      LIMIT 1`,
    [claims.openId]
  );
  const user = users[0];
  const origin = originFromRequest(req);
  if (!user || !origin) return null;
  const tokenHash = sessionHash(rawToken);
  const now = new Date();
  const expiry = claims.expiresAt;
  const needsMfa = Boolean(user.mfa_required || user.mfa_enabled);
  await pool.execute(
    `INSERT IGNORE INTO app_sessions (token_hash, user_id, origin, mfa_verified_at, created_at, last_activity_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [tokenHash, user.id, origin, needsMfa ? null : now, now, now, expiry]
  );
  return findSessionByHash(tokenHash);
}

function sessionToAuth(row) {
  if (!row) return null;
  const now = Date.now();
  const expiry = new Date(row.expires_at).getTime();
  const last = new Date(row.last_activity_at).getTime();
  if (!Number.isFinite(expiry) || expiry <= now || !Number.isFinite(last) || now - last > IDLE_MS) return { expired: true, tokenHash: row.token_hash };
  const mfaEnabled = Boolean(row.mfa_enabled);
  const mfaRequired = Boolean(row.mfa_required);
  return {
    tokenHash: row.token_hash,
    userId: Number(row.user_id),
    openId: row.open_id,
    email: row.email,
    name: row.display_name || row.email,
    role: row.role,
    allowed: Boolean(row.allow_enabled),
    mfaRequired,
    mfaEnabled,
    mfaVerified: (!mfaRequired && !mfaEnabled) || Boolean(row.mfa_verified_at),
    mfaSetupRequired: mfaRequired && !mfaEnabled,
    recoveryCount: Number(row.recovery_count || 0),
    origin: row.origin,
    expiresAt: row.expires_at
  };
}

export async function resolveSession(req) {
  if (Object.hasOwn(req, '__authResolved')) return req.__auth || null;
  req.__authResolved = true;
  const rawToken = getCookie(req, APP_SESSION_COOKIE);
  if (!rawToken || rawToken.length > 8192) return null;
  const pool = getPool();
  const tokenHash = sessionHash(rawToken);
  let row = await findSessionByHash(tokenHash);

  if (!row) {
    const platformClaims = verifyPlatformJwt(rawToken);
    if (platformClaims) {
      row = await createPreviewSession(req, rawToken, platformClaims);
    }
  }

  if (!row) {
    await pool.execute('DELETE FROM app_sessions WHERE token_hash = ?', [tokenHash]).catch(() => {});
    return null;
  }
  const auth = sessionToAuth(row);
  if (auth?.expired) {
    await pool.execute('DELETE FROM app_sessions WHERE token_hash = ?', [auth.tokenHash]);
    const origin = originFromRequest(req);
    clearCookie(req.res, APP_SESSION_COOKIE, '/', origin ? origin.startsWith('https:') : true);
    return null;
  }
  await pool.execute('UPDATE app_sessions SET last_activity_at = NOW() WHERE token_hash = ?', [tokenHash]);
  req.__auth = auth;
  return auth;
}

export async function requireAllowed(req, res, { admin = false, mfa = true, sameOrigin = false } = {}) {
  const auth = await resolveSession(req);
  if (!auth) {
    sendAuthError(res, 401, 'login_required', 'Melde dich mit deinem Manus-Konto an.');
    return null;
  }
  if (!auth.allowed) {
    sendAuthError(res, 403, 'access_denied', 'Für dieses Konto ist noch kein Zugang freigeschaltet.');
    return null;
  }
  if (admin && auth.role !== 'admin') {
    sendAuthError(res, 403, 'admin_required', 'Diese Funktion ist nur für die Administration freigegeben.');
    return null;
  }
  if (mfa && auth.mfaSetupRequired) {
    sendAuthError(res, 403, 'mfa_setup_required', 'Richte zuerst die Authenticator-App ein.');
    return null;
  }
  if (mfa && (auth.mfaRequired || auth.mfaEnabled) && !auth.mfaVerified) {
    sendAuthError(res, 403, 'mfa_verification_required', 'Bestätige den Code aus deiner Authenticator-App.');
    return null;
  }
  if (sameOrigin) {
    const origin = requestOrigin(req);
    if (!origin || origin !== auth.origin) {
      sendAuthError(res, 403, 'origin_rejected', 'Die Anfrage konnte aus Sicherheitsgründen nicht bestätigt werden.');
      return null;
    }
  }
  return auth;
}

export function registerAuthRoutes(app) {
  app.post('/api/auth/start', (req, res) => {
    setNoStore(res);
    const origin = requestOrigin(req);
    if (!origin) return sendAuthError(res, 400, 'invalid_origin', 'Die Anmeldung konnte von dieser Vorschau-Adresse nicht gestartet werden.');
    if (!withinRateLimit(startAttempts, clientAddress(req), 10, 5 * 60 * 1000)) {
      return sendAuthError(res, 429, 'rate_limited', 'Bitte warte kurz und versuche es erneut.');
    }
    const portal = process.env.MANUS_OAUTH_PORTAL_URL?.replace(/\/+$/, '');
    const appId = process.env.MANUS_PROJECT_ID;
    if (!portal || !appId) return sendAuthError(res, 503, 'oauth_unavailable', 'Die Manus-Anmeldung ist derzeit nicht verfügbar.');
    const nonce = crypto.randomBytes(32).toString('base64url');
    const redirectUri = `${origin}/api/auth/callback`;
    const state = Buffer.from(JSON.stringify({ redirectUri, nonce, rememberDevice: Boolean(req.body?.rememberDevice) }), 'utf8').toString('base64');
    setCookie(res, OAUTH_STATE_COOKIE, nonce, { maxAgeSeconds: stateTtlSeconds, path: '/api/auth', httpOnly: true, secure: origin.startsWith('https:') });
    const url = new URL(`${portal}/app-auth`);
    url.searchParams.set('appId', appId);
    url.searchParams.set('redirectUri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('responseType', 'code');
    return res.json({ url: url.toString() });
  });

  app.get('/api/auth/callback', async (req, res) => {
    setNoStore(res);
    const stateCookie = oauthStateCookie(req);
    let state;
    try {
      const encoded = String(req.query.state || '');
      if (encoded.length > 4096) throw new Error('oversized state');
      state = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    } catch {
      return res.redirect(303, '/privat.html?auth=state_error');
    }
    const nonce = String(state?.nonce || '');
    const redirectUri = String(state?.redirectUri || '');
    if (!stateCookie || !safeEqual(nonce, stateCookie) || !validCallbackUri(redirectUri)) {
      clearCookie(res, OAUTH_STATE_COOKIE, '/api/auth');
      return res.redirect(303, '/privat.html?auth=state_error');
    }
    const origin = new URL(redirectUri).origin;
    clearCookie(res, OAUTH_STATE_COOKIE, '/api/auth', origin.startsWith('https:'));
    if (req.query.error || typeof req.query.code !== 'string' || req.query.code.length > 4096) {
      return res.redirect(303, `${origin}/privat.html?auth=cancelled`);
    }
    try {
      const token = await exchangeCode(req.query.code, redirectUri);
      const identity = await getManusIdentity(token);
      const pool = getPool();
      const [allowRows] = await pool.execute(
        'SELECT role, enabled, mfa_required FROM access_allowlist WHERE email = ? LIMIT 1',
        [identity.email]
      );
      const access = allowRows[0];
      if (!access || !access.enabled) return res.redirect(303, `${origin}/privat.html?auth=not_allowed`);

      const [userRows] = await pool.execute('SELECT id, email, open_id FROM app_users WHERE email = ? LIMIT 1', [identity.email]);
      const existingUser = userRows[0];
      let userId;
      if (existingUser) {
        if (existingUser.open_id && existingUser.open_id !== identity.openId) {
          return res.redirect(303, `${origin}/privat.html?auth=identity_conflict`);
        }
        await pool.execute(
          `UPDATE app_users
              SET open_id = ?, display_name = ?, role = ?, allowed = 1, mfa_required = ?, updated_at = NOW()
            WHERE id = ? AND (open_id IS NULL OR open_id = ?)`,
          [identity.openId, identity.name, access.role, access.mfa_required, existingUser.id, identity.openId]
        );
        const [confirmed] = await pool.execute('SELECT id FROM app_users WHERE id = ? AND open_id = ? LIMIT 1', [existingUser.id, identity.openId]);
        if (!confirmed[0]) return res.redirect(303, `${origin}/privat.html?auth=identity_conflict`);
        userId = existingUser.id;
      } else {
        const [openIdRows] = await pool.execute('SELECT id FROM app_users WHERE open_id = ? LIMIT 1', [identity.openId]);
        if (openIdRows.length) return res.redirect(303, `${origin}/privat.html?auth=identity_conflict`);
        const [inserted] = await pool.execute(
          `INSERT INTO app_users (open_id, email, display_name, role, allowed, mfa_required)
           VALUES (?, ?, ?, ?, 1, ?)`,
          [identity.openId, identity.email, identity.name, access.role, access.mfa_required]
        );
        userId = inserted.insertId;
      }
      const user = { id: userId };
      if (!user.id) throw new Error('Allowed account was not available after identity resolution');
      const [mfaRows] = await pool.execute('SELECT enabled FROM user_mfa WHERE user_id = ? LIMIT 1', [user.id]);
      const mfaEnabled = Boolean(mfaRows[0]?.enabled);
      const mustUseMfa = Boolean(access.mfa_required || mfaEnabled);
      const persistent = Boolean(state.rememberDevice);
      const now = new Date();
      const tokenValue = randomSessionToken();
      const expiresAt = new Date(now.getTime() + (persistent ? REMEMBER_MS : ABSOLUTE_MS));
      await pool.execute(
        `INSERT INTO app_sessions (token_hash, user_id, origin, mfa_verified_at, created_at, last_activity_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sessionHash(tokenValue), user.id, origin, mustUseMfa ? null : now, now, now, expiresAt]
      );
      setAppSessionCookie(res, tokenValue, persistent, origin.startsWith('https:'));
      return res.redirect(303, `${origin}/privat.html?auth=success`);
    } catch (error) {
      console.error('Manus OAuth callback failed:', error?.code || error?.name || 'unknown error');
      return res.redirect(303, `${origin}/privat.html?auth=unavailable`);
    }
  });

  app.get('/api/auth/status', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await resolveSession(req);
      if (!auth) return res.json({ authenticated: false });
      return res.json({
        authenticated: true,
        name: auth.name,
        email: auth.email,
        role: auth.role,
        mfaEnabled: auth.mfaEnabled,
        mfaRequired: auth.mfaRequired,
        mfaVerified: auth.mfaVerified,
        mfaSetupRequired: auth.mfaSetupRequired,
        mfaVerificationRequired: (auth.mfaRequired || auth.mfaEnabled) && !auth.mfaVerified,
        recoveryCodesRemaining: auth.recoveryCount
      });
    } catch {
      return sendAuthError(res, 503, 'status_unavailable', 'Der Anmeldestatus ist vorübergehend nicht verfügbar.');
    }
  });

  app.post('/api/auth/mfa/setup', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await requireAllowed(req, res, { mfa: false, sameOrigin: true });
      if (!auth) return;
      if (auth.mfaEnabled) return sendAuthError(res, 409, 'mfa_already_enabled', 'Die Authenticator-App ist bereits eingerichtet.');
      if (!withinRateLimit(startAttempts, `mfa-setup:${auth.userId}`, 5, 10 * 60 * 1000)) {
        return sendAuthError(res, 429, 'mfa_temporarily_locked', 'Zu viele Einrichtungsversuche. Warte zehn Minuten und versuche es erneut.');
      }
      const enrollment = await createEnrollment(auth.email);
      const pool = getPool();
      await pool.execute(
        `INSERT INTO user_mfa (user_id, pending_ciphertext, enabled)
         VALUES (?, ?, 0)
         ON DUPLICATE KEY UPDATE pending_ciphertext = VALUES(pending_ciphertext), failed_attempts = 0, locked_until = NULL`,
        [auth.userId, encryptSeed(enrollment.base32)]
      );
      return res.json({ qrDataUrl: enrollment.qrDataUrl, otpauthUri: enrollment.uri, secret: enrollment.base32 });
    } catch {
      return sendAuthError(res, 503, 'mfa_setup_unavailable', 'Die Einrichtung konnte gerade nicht gestartet werden.');
    }
  });

  app.post('/api/auth/mfa/verify-setup', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await requireAllowed(req, res, { mfa: false, sameOrigin: true });
      if (!auth) return;
      const pool = getPool();
      const [rows] = await pool.execute('SELECT pending_ciphertext, failed_attempts, locked_until FROM user_mfa WHERE user_id = ? LIMIT 1', [auth.userId]);
      if (!rows[0]?.pending_ciphertext) return sendAuthError(res, 409, 'mfa_setup_missing', 'Starte die Einrichtung erneut.');
      if (rows[0].locked_until && new Date(rows[0].locked_until).getTime() > Date.now()) {
        return sendAuthError(res, 429, 'mfa_temporarily_locked', 'Zu viele Fehlversuche. Warte einige Minuten und versuche es erneut.');
      }
      const seed = decryptSeed(rows[0].pending_ciphertext);
      if (!verifyTotp(seed, req.body?.token)) {
        const attempts = Number(rows[0].failed_attempts || 0) + 1;
        const lockedUntil = attempts >= 5 ? new Date(Date.now() + 10 * 60 * 1000) : null;
        await pool.execute(
          'UPDATE user_mfa SET failed_attempts = ?, locked_until = ? WHERE user_id = ?',
          [lockedUntil ? 0 : attempts, lockedUntil, auth.userId]
        );
        return sendAuthError(res, lockedUntil ? 429 : 400, lockedUntil ? 'mfa_temporarily_locked' : 'invalid_totp', lockedUntil ? 'Zu viele Fehlversuche. Warte zehn Minuten und versuche es erneut.' : 'Der Code stimmt nicht. Prüfe die App und versuche es erneut.');
      }
      const recoveryCodes = generateRecoveryCodes(10);
      const recoveryHashes = recoveryCodes.map(hashRecoveryCode);
      await pool.execute(
        `UPDATE user_mfa
            SET totp_ciphertext = ?, pending_ciphertext = NULL, recovery_hashes = ?, enabled = 1,
                failed_attempts = 0, locked_until = NULL
          WHERE user_id = ?`,
        [encryptSeed(seed), JSON.stringify(recoveryHashes), auth.userId]
      );
      await pool.execute('UPDATE app_sessions SET mfa_verified_at = NOW(), last_activity_at = NOW() WHERE token_hash = ?', [auth.tokenHash]);
      return res.json({ enabled: true, recoveryCodes });
    } catch {
      return sendAuthError(res, 503, 'mfa_setup_unavailable', 'Die Einrichtung konnte gerade nicht abgeschlossen werden.');
    }
  });

  app.post('/api/auth/mfa/verify', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await requireAllowed(req, res, { mfa: false, sameOrigin: true });
      if (!auth) return;
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT totp_ciphertext, recovery_hashes, enabled, failed_attempts, locked_until FROM user_mfa WHERE user_id = ? LIMIT 1',
        [auth.userId]
      );
      const mfa = rows[0];
      if (!mfa?.enabled || !mfa.totp_ciphertext) return sendAuthError(res, 409, 'mfa_setup_required', 'Richte zuerst die Authenticator-App ein.');
      if (mfa.locked_until && new Date(mfa.locked_until).getTime() > Date.now()) {
        return sendAuthError(res, 429, 'mfa_temporarily_locked', 'Zu viele Fehlversuche. Warte einige Minuten und versuche es erneut.');
      }
      const token = String(req.body?.token || '').trim();
      let valid = false;
      let nextRecoveryHashes = Array.isArray(mfa.recovery_hashes) ? mfa.recovery_hashes : [];
      if (/^\d{6}$/.test(token)) {
        valid = verifyTotp(decryptSeed(mfa.totp_ciphertext), token);
      } else {
        const index = matchRecoveryCode(token, nextRecoveryHashes);
        if (index >= 0) {
          valid = true;
          nextRecoveryHashes = nextRecoveryHashes.filter((_, current) => current !== index);
        }
      }
      if (!valid) {
        const attempts = Number(mfa.failed_attempts || 0) + 1;
        const lockedUntil = attempts >= 5 ? new Date(Date.now() + 10 * 60 * 1000) : null;
        await pool.execute(
          'UPDATE user_mfa SET failed_attempts = ?, locked_until = ? WHERE user_id = ?',
          [lockedUntil ? 0 : attempts, lockedUntil, auth.userId]
        );
        return sendAuthError(res, lockedUntil ? 429 : 400, lockedUntil ? 'mfa_temporarily_locked' : 'invalid_totp', lockedUntil ? 'Zu viele Fehlversuche. Warte zehn Minuten und versuche es erneut.' : 'Der Code stimmt nicht. Bitte versuche es noch einmal.');
      }
      if (nextRecoveryHashes !== mfa.recovery_hashes) {
        await pool.execute('UPDATE user_mfa SET recovery_hashes = ?, failed_attempts = 0, locked_until = NULL WHERE user_id = ?', [JSON.stringify(nextRecoveryHashes), auth.userId]);
      } else {
        await pool.execute('UPDATE user_mfa SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?', [auth.userId]);
      }
      await pool.execute('UPDATE app_sessions SET mfa_verified_at = NOW(), last_activity_at = NOW() WHERE token_hash = ?', [auth.tokenHash]);
      return res.json({ verified: true, recoveryCodesRemaining: nextRecoveryHashes.length });
    } catch {
      return sendAuthError(res, 503, 'mfa_verification_unavailable', 'Die Prüfung ist vorübergehend nicht verfügbar.');
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    setNoStore(res);
    try {
      const origin = requestOrigin(req);
      const auth = await resolveSession(req);
      if (auth && origin && origin === auth.origin) {
        await getPool().execute('DELETE FROM app_sessions WHERE token_hash = ?', [auth.tokenHash]);
      }
    } catch {}
    const origin = requestOrigin(req);
    const secure = origin ? origin.startsWith('https:') : true;
    clearCookie(res, APP_SESSION_COOKIE, '/', secure);
    clearCookie(res, OAUTH_STATE_COOKIE, '/api/auth', secure);
    return res.json({ loggedOut: true });
  });
}
