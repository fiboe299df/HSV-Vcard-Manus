import crypto from 'node:crypto';
import multer from 'multer';
import { getPool } from './db.js';
import { requireAllowed } from './auth.js';
import { createPrivateDownloadUrl, PRIVATE_DOWNLOAD_TTL_SECONDS, uploadPrivateObject } from './storage.js';
import { setNoStore } from './security.js';

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1, fields: 4, parts: 6 }
});
const PROFILE_FIELDS = ['private_phone', 'private_email', 'private_street', 'private_zip', 'private_city', 'country'];

function fail(res, status, code, message) {
  setNoStore(res);
  return res.status(status).json({ error: code, message });
}

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function profileValue(value, limit) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const text = String(value).trim();
  return text.length <= limit ? text : undefined;
}

function safeFilename(value) {
  const basename = String(value || 'Dokument.pdf').split(/[\\/]/).pop().replace(/[\u0000-\u001f\u007f]/g, '').trim();
  const cleaned = basename.replace(/[^A-Za-z0-9._ -]/g, '_').slice(0, 180);
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned || 'Dokument'}.pdf`;
}

function validId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

async function ensureAuth(req, res, options = {}) {
  const auth = await requireAllowed(req, res, { mfa: true, ...options });
  if (!auth) return null;
  return auth;
}

export function registerAdminRoutes(app) {
  app.get('/api/private/profile', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res);
      if (!auth) return;
      const [rows] = await getPool().execute(
        `SELECT private_phone, private_email, private_street, private_zip, private_city, country, updated_at
           FROM private_profiles WHERE user_id = ? LIMIT 1`,
        [auth.userId]
      );
      return res.json({ profile: rows[0] || null });
    } catch {
      return fail(res, 503, 'profile_unavailable', 'Die privaten Kontaktdaten sind derzeit nicht verfügbar.');
    }
  });

  app.get('/api/private/documents', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res);
      if (!auth) return;
      const [rows] = auth.role === 'admin'
        ? await getPool().execute(
          `SELECT id, filename, mime_type, size_bytes, visible_to_users, created_at, updated_at
             FROM private_documents WHERE deleted_at IS NULL ORDER BY created_at DESC`
        )
        : await getPool().execute(
          `SELECT id, filename, mime_type, size_bytes, visible_to_users, created_at, updated_at
             FROM private_documents WHERE deleted_at IS NULL AND visible_to_users = 1 ORDER BY created_at DESC`
        );
      return res.json({ documents: rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        mimeType: row.mime_type,
        sizeBytes: Number(row.size_bytes),
        visibleToUsers: Boolean(row.visible_to_users),
        createdAt: row.created_at
      })) });
    } catch {
      return fail(res, 503, 'documents_unavailable', 'Die Dokumentliste ist derzeit nicht verfügbar.');
    }
  });

  app.get('/api/private/documents/:id/download', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res);
      if (!auth) return;
      if (!validId(req.params.id)) return fail(res, 400, 'invalid_document', 'Das Dokument wurde nicht gefunden.');
      const [rows] = await getPool().execute(
        `SELECT id, object_key, filename, mime_type, visible_to_users
           FROM private_documents WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
        [req.params.id]
      );
      const document = rows[0];
      if (!document || (auth.role !== 'admin' && !document.visible_to_users)) return fail(res, 404, 'document_not_found', 'Das Dokument wurde nicht gefunden.');
      const downloadUrl = await createPrivateDownloadUrl(document.object_key);
      return res.json({ downloadUrl, filename: document.filename, mimeType: document.mime_type, expiresInSeconds: PRIVATE_DOWNLOAD_TTL_SECONDS });
    } catch {
      return fail(res, 503, 'document_unavailable', 'Der geschützte Dokumentzugriff ist derzeit nicht verfügbar.');
    }
  });

  app.put('/api/admin/profile', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true, sameOrigin: true });
      if (!auth) return;
      const values = PROFILE_FIELDS.map((field) => profileValue(req.body?.[field], field === 'private_email' ? 320 : field === 'private_street' ? 255 : field === 'private_city' ? 191 : field === 'private_phone' ? 64 : field === 'private_zip' ? 32 : 100));
      if (values.some((value) => value === undefined)) return fail(res, 400, 'profile_value_too_long', 'Mindestens ein Feld ist zu lang.');
      if (values[1] && !normalizeEmail(values[1])) return fail(res, 400, 'invalid_private_email', 'Bitte gib eine gültige private E-Mail-Adresse ein.');
      await getPool().execute(
        `INSERT INTO private_profiles (user_id, private_phone, private_email, private_street, private_zip, private_city, country)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE private_phone = VALUES(private_phone), private_email = VALUES(private_email),
           private_street = VALUES(private_street), private_zip = VALUES(private_zip), private_city = VALUES(private_city), country = VALUES(country)`,
        [auth.userId, ...values]
      );
      return res.json({ saved: true });
    } catch {
      return fail(res, 503, 'profile_save_failed', 'Die privaten Kontaktdaten konnten nicht gespeichert werden.');
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true });
      if (!auth) return;
      const [rows] = await getPool().execute(
        `SELECT a.email, a.role, a.enabled, a.mfa_required, u.display_name, m.enabled AS mfa_enabled,
                (SELECT MAX(s.last_activity_at) FROM app_sessions s WHERE s.user_id = u.id) AS last_activity_at
           FROM access_allowlist a
           LEFT JOIN app_users u ON u.email = a.email
           LEFT JOIN user_mfa m ON m.user_id = u.id
          ORDER BY CASE a.role WHEN 'admin' THEN 0 ELSE 1 END, a.email`
      );
      return res.json({ users: rows.map((row) => ({
        email: row.email,
        name: row.display_name || null,
        role: row.role,
        enabled: Boolean(row.enabled),
        mfaRequired: Boolean(row.mfa_required),
        mfaEnabled: Boolean(row.mfa_enabled),
        lastActivityAt: row.last_activity_at
      })) });
    } catch {
      return fail(res, 503, 'users_unavailable', 'Die Zugangsliste ist derzeit nicht verfügbar.');
    }
  });

  app.put('/api/admin/users/:email/access', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true, sameOrigin: true });
      if (!auth) return;
      const email = normalizeEmail(req.params.email);
      if (!email || typeof req.body?.enabled !== 'boolean') return fail(res, 400, 'invalid_access_change', 'Bitte prüfe die E-Mail-Adresse und den Freigabestatus.');
      const [existingRows] = await getPool().execute('SELECT role FROM access_allowlist WHERE email = ? LIMIT 1', [email]);
      if (existingRows[0]?.role === 'admin') return fail(res, 403, 'admin_access_protected', 'Der bestehende Administrationszugang kann hier nicht geändert werden.');
      await getPool().execute(
        `INSERT INTO access_allowlist (email, role, enabled, mfa_required)
         VALUES (?, 'user', ?, 0)
         ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)`,
        [email, req.body.enabled ? 1 : 0]
      );
      const [users] = await getPool().execute('SELECT id FROM app_users WHERE email = ? LIMIT 1', [email]);
      if (users[0]) {
        await getPool().execute('UPDATE app_users SET allowed = ?, role = \'user\', mfa_required = 0, updated_at = NOW() WHERE id = ?', [req.body.enabled ? 1 : 0, users[0].id]);
        if (!req.body.enabled) await getPool().execute('DELETE FROM app_sessions WHERE user_id = ?', [users[0].id]);
      }
      return res.json({ email, enabled: req.body.enabled });
    } catch {
      return fail(res, 503, 'access_change_failed', 'Die Zugangsfreigabe konnte nicht gespeichert werden.');
    }
  });

  app.post('/api/admin/users/:email/mfa-reset', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true, sameOrigin: true });
      if (!auth) return;
      const email = normalizeEmail(req.params.email);
      if (!email) return fail(res, 400, 'invalid_email', 'Die E-Mail-Adresse ist ungültig.');
      if (email === auth.email) return fail(res, 403, 'self_mfa_reset_blocked', 'Die eigene Admin-MFA kann nicht über diese Funktion zurückgesetzt werden.');
      const [rows] = await getPool().execute(
        `SELECT u.id, a.role FROM app_users u JOIN access_allowlist a ON a.email = u.email WHERE u.email = ? LIMIT 1`,
        [email]
      );
      if (!rows[0] || rows[0].role === 'admin') return fail(res, 404, 'user_not_found', 'Für diesen Nutzer ist kein Zurücksetzen möglich.');
      await getPool().execute('DELETE FROM user_mfa WHERE user_id = ?', [rows[0].id]);
      await getPool().execute('DELETE FROM app_sessions WHERE user_id = ?', [rows[0].id]);
      return res.json({ reset: true });
    } catch {
      return fail(res, 503, 'mfa_reset_failed', 'Die MFA konnte nicht zurückgesetzt werden.');
    }
  });

  app.post('/api/admin/documents', async (req, res, next) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true, sameOrigin: true });
      if (!auth) return;
      req.adminAuth = auth;
      return next();
    } catch {
      return fail(res, 503, 'upload_unavailable', 'Der Dokumentupload ist derzeit nicht verfügbar.');
    }
  }, uploadPdf.single('file'), async (req, res) => {
    setNoStore(res);
    try {
      const file = req.file;
      if (!file || file.mimetype !== 'application/pdf' || file.size < 5 || file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        return fail(res, 400, 'invalid_pdf', 'Bitte wähle eine gültige PDF-Datei aus.');
      }
      const id = crypto.randomUUID();
      const objectKey = `private-documents/${crypto.randomBytes(16).toString('hex')}-${id}.pdf`;
      const filename = safeFilename(file.originalname);
      await uploadPrivateObject(objectKey, file.buffer, 'application/pdf');
      await getPool().execute(
        `INSERT INTO private_documents (id, object_key, filename, mime_type, size_bytes, visible_to_users, created_by)
         VALUES (?, ?, ?, 'application/pdf', ?, 0, ?)`,
        [id, objectKey, filename, file.size, req.adminAuth.userId]
      );
      return res.status(201).json({ id, filename, sizeBytes: file.size, visibleToUsers: false });
    } catch {
      return fail(res, 503, 'upload_failed', 'Das Dokument konnte nicht sicher gespeichert werden.');
    }
  });

  app.put('/api/admin/documents/:id/visibility', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true, sameOrigin: true });
      if (!auth) return;
      if (!validId(req.params.id) || typeof req.body?.visibleToUsers !== 'boolean') return fail(res, 400, 'invalid_document_change', 'Bitte prüfe Dokument und Sichtbarkeit.');
      const [result] = await getPool().execute(
        'UPDATE private_documents SET visible_to_users = ? WHERE id = ? AND deleted_at IS NULL',
        [req.body.visibleToUsers ? 1 : 0, req.params.id]
      );
      if (!result.affectedRows) return fail(res, 404, 'document_not_found', 'Das Dokument wurde nicht gefunden.');
      return res.json({ id: req.params.id, visibleToUsers: req.body.visibleToUsers });
    } catch {
      return fail(res, 503, 'document_update_failed', 'Die Dokumentfreigabe konnte nicht geändert werden.');
    }
  });

  app.delete('/api/admin/documents/:id', async (req, res) => {
    setNoStore(res);
    try {
      const auth = await ensureAuth(req, res, { admin: true, sameOrigin: true });
      if (!auth) return;
      if (!validId(req.params.id)) return fail(res, 400, 'invalid_document', 'Das Dokument wurde nicht gefunden.');
      const [result] = await getPool().execute(
        'UPDATE private_documents SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
        [req.params.id]
      );
      if (!result.affectedRows) return fail(res, 404, 'document_not_found', 'Das Dokument wurde nicht gefunden.');
      return res.json({ deleted: true, storageObjectRetained: true });
    } catch {
      return fail(res, 503, 'document_delete_failed', 'Das Dokument konnte nicht aus der Liste entfernt werden.');
    }
  });
}
