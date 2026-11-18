const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const notice = $('#notice');
const loginPanel = $('#login-panel');
const authPanel = $('#auth-panel');
const setupPanel = $('#mfa-setup-panel');
const verifyPanel = $('#mfa-verify-panel');
const recoveryPanel = $('#recovery-panel');
const privatePanel = $('#private-panel');
const adminPanel = $('#admin-panel');
let currentUser = null;
let recoveryCodes = [];
let idleTimer;
const IDLE_LIMIT = 30 * 60 * 1000;

function showNotice(message, tone = 'info') {
  notice.textContent = message;
  notice.className = `notice notice-${tone}`;
  notice.hidden = false;
}

function clearNotice() {
  notice.textContent = '';
  notice.hidden = true;
}

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { ...options, headers, credentials: 'same-origin', cache: 'no-store' });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || 'Die Anfrage konnte nicht abgeschlossen werden.');
    error.code = body.error;
    error.status = response.status;
    throw error;
  }
  return body;
}

function setBusy(form, busy) {
  $$('button, input', form).forEach((control) => { control.disabled = busy; });
}

function showRecoveryCodes(codes) {
  recoveryCodes = Array.isArray(codes) ? codes : [];
  const list = $('#recovery-codes');
  list.replaceChildren(...recoveryCodes.map((code) => {
    const item = document.createElement('li');
    const value = document.createElement('code');
    value.textContent = code;
    item.append(value);
    return item;
  }));
  recoveryPanel.hidden = recoveryCodes.length === 0;
  recoveryPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateActivity() {
  clearTimeout(idleTimer);
  if (!currentUser) return;
  idleTimer = setTimeout(async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
    location.assign('/privat.html?auth=idle');
  }, IDLE_LIMIT);
}

for (const eventName of ['pointerdown', 'keydown', 'touchstart', 'scroll']) {
  document.addEventListener(eventName, updateActivity, { passive: true });
}

function renderProfile(profile) {
  const list = $('#private-contact-list');
  list.replaceChildren();
  const rows = [
    ['Telefon', profile?.private_phone, 'tel'],
    ['E-Mail', profile?.private_email, 'mailto'],
    ['Adresse', [profile?.private_street, [profile?.private_zip, profile?.private_city].filter(Boolean).join(' ')].filter(Boolean).join(', '), null],
    ['Land', profile?.country, null]
  ];
  const visible = rows.filter(([, value]) => String(value || '').trim());
  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Für dieses Konto sind noch keine privaten Kontaktdaten hinterlegt.';
    list.append(empty);
  }
  for (const [label, value, scheme] of visible) {
    const row = document.createElement('div');
    row.className = 'contact-row';
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    const text = document.createElement(scheme ? 'a' : 'span');
    text.textContent = value;
    if (scheme === 'tel' || scheme === 'mailto') text.href = `${scheme}:${value}`;
    detail.append(text);
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'copy-button';
    copy.textContent = 'Kopieren';
    copy.setAttribute('aria-label', `${label} kopieren`);
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(value); showNotice(`${label} wurde kopiert.`, 'success'); }
      catch { showNotice('Kopieren ist auf diesem Gerät nicht verfügbar.', 'error'); }
    });
    detail.append(copy);
    row.append(term, detail);
    list.append(row);
  }
}

function formatSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value / 1024 / 1024) + ' MB';
}

async function getDocumentLink(id) {
  const body = await api(`/api/private/documents/${encodeURIComponent(id)}/download`);
  return body.downloadUrl;
}

async function openDocument(id, filename, preferNewTab = false) {
  clearNotice();
  $('#document-title').textContent = filename;
  $('#document-frame').removeAttribute('src');
  $('#document-download').removeAttribute('href');
  const mobile = window.matchMedia('(max-width: 680px)').matches;
  let popup = null;
  if (mobile && preferNewTab) {
    popup = window.open('', '_blank');
    if (popup) popup.opener = null;
  }
  try {
    const url = await getDocumentLink(id);
    if (popup && !popup.closed) {
      popup.location.replace(url);
      return;
    }
    $('#document-frame').src = url;
    $('#document-download').href = url;
    $('#document-dialog').showModal();
    if (mobile && preferNewTab) showNotice('Der Browser hat den neuen Tab blockiert. Nutze „In neuem Tab öffnen / laden“ in der Dokumentansicht.', 'info');
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    showNotice(error.message, 'error');
  }
}

function renderDocuments(documents, admin = false) {
  const list = admin ? $('#admin-documents-list') : $('#documents-list');
  list.replaceChildren();
  if (!documents?.length) {
    const empty = document.createElement('li');
    empty.className = 'muted empty-state';
    empty.textContent = admin ? 'Noch keine Dokumente gespeichert.' : 'Derzeit sind keine Dokumente freigegeben.';
    list.append(empty);
    return;
  }
  for (const documentInfo of documents) {
    const item = document.createElement('li');
    item.className = admin ? 'admin-document' : 'document-item';
    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = documentInfo.filename;
    const meta = document.createElement('span');
    meta.className = 'muted document-meta';
    meta.textContent = [formatSize(documentInfo.sizeBytes), documentInfo.visibleToUsers ? 'für freigegebene Nutzer sichtbar' : 'nur Admin'].filter(Boolean).join(' · ');
    info.append(title, meta);
    const actions = document.createElement('div');
    actions.className = 'button-row document-actions';
    const view = document.createElement('button');
    view.type = 'button';
    view.className = 'button button-primary button-small';
    view.textContent = 'Ansehen';
    view.addEventListener('click', () => openDocument(documentInfo.id, documentInfo.filename, true));
    actions.append(view);
    if (admin) {
      const visibility = document.createElement('button');
      visibility.type = 'button';
      visibility.className = 'button button-subtle button-small';
      visibility.textContent = documentInfo.visibleToUsers ? 'Sperren' : 'Für Nutzer freigeben';
      visibility.addEventListener('click', async () => {
        try {
          await api(`/api/admin/documents/${encodeURIComponent(documentInfo.id)}/visibility`, {
            method: 'PUT', body: JSON.stringify({ visibleToUsers: !documentInfo.visibleToUsers })
          });
          await loadDocuments();
          showNotice('Dokumentenfreigabe aktualisiert.', 'success');
        } catch (error) { showNotice(error.message, 'error'); }
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button-danger button-small';
      remove.textContent = 'Aus Liste entfernen';
      remove.addEventListener('click', async () => {
        if (!window.confirm('Diesen Dokumenteintrag aus der Liste entfernen? Die gespeicherten Objektbytes werden dabei nicht gelöscht.')) return;
        try {
          await api(`/api/admin/documents/${encodeURIComponent(documentInfo.id)}`, { method: 'DELETE' });
          await loadDocuments();
          showNotice('Dokumenteintrag wurde ausgeblendet.', 'success');
        } catch (error) { showNotice(error.message, 'error'); }
      });
      actions.append(visibility, remove);
    }
    item.append(info, actions);
    list.append(item);
  }
}

async function loadDocuments() {
  const result = await api('/api/private/documents');
  renderDocuments(result.documents, false);
  if (currentUser?.role === 'admin') renderDocuments(result.documents, true);
  return result.documents;
}

function populateAdminProfile(profile) {
  const form = $('#profile-form');
  if (!profile) return;
  for (const field of ['private_phone', 'private_email', 'private_street', 'private_zip', 'private_city', 'country']) {
    form.elements[field].value = profile[field] || '';
  }
}

async function loadUsers() {
  const result = await api('/api/admin/users');
  const container = $('#users-list');
  container.replaceChildren();
  if (!result.users.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Es sind noch keine weiteren Konten aufgeführt.';
    container.append(empty);
    return;
  }
  for (const user of result.users) {
    const row = document.createElement('div');
    row.className = 'user-row';
    const details = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = user.name || user.email;
    const meta = document.createElement('span');
    meta.className = 'muted document-meta';
    meta.textContent = `${user.email} · ${user.role === 'admin' ? 'Admin' : user.enabled ? 'Freigegeben' : 'Gesperrt'}${user.mfaEnabled ? ' · MFA aktiv' : ''}`;
    details.append(name, meta);
    const actions = document.createElement('div');
    actions.className = 'button-row';
    if (user.role !== 'admin') {
      const access = document.createElement('button');
      access.type = 'button';
      access.className = `button ${user.enabled ? 'button-danger' : 'button-primary'} button-small`;
      access.textContent = user.enabled ? 'Zugang sperren' : 'Freigeben';
      access.addEventListener('click', async () => {
        try {
          await api(`/api/admin/users/${encodeURIComponent(user.email)}/access`, {
            method: 'PUT', body: JSON.stringify({ enabled: !user.enabled })
          });
          await loadUsers();
          showNotice('Zugangsstatus aktualisiert.', 'success');
        } catch (error) { showNotice(error.message, 'error'); }
      });
      actions.append(access);
      if (user.mfaEnabled) {
        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'button button-subtle button-small';
        reset.textContent = 'MFA zurücksetzen';
        reset.addEventListener('click', async () => {
          if (!window.confirm(`MFA und bestehende Sitzungen für ${user.email} zurücksetzen?`)) return;
          try {
            await api(`/api/admin/users/${encodeURIComponent(user.email)}/mfa-reset`, { method: 'POST', body: '{}' });
            await loadUsers();
            showNotice('MFA und bestehende Sitzungen wurden zurückgesetzt.', 'success');
          } catch (error) { showNotice(error.message, 'error'); }
        });
        actions.append(reset);
      }
    }
    row.append(details, actions);
    container.append(row);
  }
}

async function loadAdminPanel() {
  if (currentUser?.role !== 'admin') return;
  adminPanel.hidden = false;
  const [profile] = await Promise.all([api('/api/private/profile'), loadUsers()]);
  populateAdminProfile(profile.profile);
}

async function activatePrivateArea() {
  setupPanel.hidden = true;
  verifyPanel.hidden = true;
  recoveryPanel.hidden = true;
  privatePanel.hidden = false;
  try {
    const [profile, documents] = await Promise.all([api('/api/private/profile'), loadDocuments()]);
    renderProfile(profile.profile);
    await loadAdminPanel();
    const requested = new URLSearchParams(window.location.search).get('document');
    if (requested === 'cv') {
      const cv = documents.find((item) => /^(lebenslauf|cv)(\.pdf)?$/i.test(String(item.filename || '').trim()));
      if (cv) await openDocument(cv.id, cv.filename);
      else showNotice('Der geschützte Lebenslauf ist derzeit nicht verfügbar.', 'info');
    } else {
      clearNotice();
    }
  } catch (error) {
    privatePanel.hidden = true;
    showNotice(error.message, 'error');
  }
}

function renderAuth(auth) {
  currentUser = auth;
  loginPanel.hidden = true;
  authPanel.hidden = false;
  privatePanel.hidden = true;
  $('#account-name').textContent = auth.name || 'Manus-Konto';
  $('#account-email').textContent = `${auth.email} · ${auth.role === 'admin' ? 'Admin' : 'Nutzer'}`;
  updateActivity();
  if (auth.mfaSetupRequired) {
    setupPanel.hidden = false;
    verifyPanel.hidden = true;
    privatePanel.hidden = true;
    beginMfaSetup();
    return;
  }
  if (auth.mfaVerificationRequired) {
    setupPanel.hidden = true;
    verifyPanel.hidden = false;
    privatePanel.hidden = true;
    $('#verify-code').focus();
    return;
  }
  activatePrivateArea();
}

async function beginMfaSetup() {
  try {
    const result = await api('/api/auth/mfa/setup', { method: 'POST', body: '{}' });
    $('#mfa-qr').src = result.qrDataUrl;
    $('#mfa-secret').textContent = result.secret;
    $('#otpauth-link').href = result.otpauthUri;
  } catch (error) {
    showNotice(error.message, 'error');
  }
}

$('#login-button').addEventListener('click', async () => {
  clearNotice();
  $('#login-button').disabled = true;
  try {
    const result = await api('/api/auth/start', {
      method: 'POST', body: JSON.stringify({ rememberDevice: $('#remember-device').checked })
    });
    location.assign(result.url);
  } catch (error) {
    showNotice(error.message, 'error');
    $('#login-button').disabled = false;
  }
});

$('#logout-button').addEventListener('click', async () => {
  $('#logout-button').disabled = true;
  try { await api('/api/auth/logout', { method: 'POST' }); }
  finally { location.assign('/privat.html?auth=logout'); }
});

$('#setup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(form, true);
  try {
    const result = await api('/api/auth/mfa/verify-setup', {
      method: 'POST', body: JSON.stringify({ token: $('#setup-code').value.trim() })
    });
    setupPanel.hidden = true;
    showRecoveryCodes(result.recoveryCodes);
    await refreshStatus();
    showNotice('Authenticator-App aktiviert. Bewahre die Wiederherstellungscodes sicher auf.', 'success');
  } catch (error) { showNotice(error.message, 'error'); }
  finally { setBusy(form, false); }
});

$('#verify-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(form, true);
  try {
    await api('/api/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ token: $('#verify-code').value.trim() }) });
    await refreshStatus();
    showNotice('Anmeldung bestätigt.', 'success');
  } catch (error) { showNotice(error.message, 'error'); }
  finally { setBusy(form, false); }
});

$('#copy-secret').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#mfa-secret').textContent); showNotice('Authenticator-Schlüssel kopiert.', 'success'); }
  catch { showNotice('Kopieren ist auf diesem Gerät nicht verfügbar.', 'error'); }
});

$('#copy-recovery').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(recoveryCodes.join('\n')); showNotice('Wiederherstellungscodes kopiert.', 'success'); }
  catch { showNotice('Kopieren ist auf diesem Gerät nicht verfügbar.', 'error'); }
});

$('#download-recovery').addEventListener('click', () => {
  const blob = new Blob([`HSV-Privatbereich – Wiederherstellungscodes\n\n${recoveryCodes.join('\n')}\n\nJeder Code ist nur einmal verwendbar. Bewahre diese Datei sicher auf.\n`], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'hsv-wiederherstellungscodes.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

$('#dismiss-recovery').addEventListener('click', () => {
  recoveryPanel.hidden = true;
  recoveryCodes = [];
  refreshStatus();
});

$('#profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(form, true);
  try {
    const data = Object.fromEntries(new FormData(form).entries());
    await api('/api/admin/profile', { method: 'PUT', body: JSON.stringify(data) });
    const result = await api('/api/private/profile');
    renderProfile(result.profile);
    showNotice('Private Kontaktdaten gespeichert.', 'success');
  } catch (error) { showNotice(error.message, 'error'); }
  finally { setBusy(form, false); }
});

const uploadFileInput = $('#document-file');
const uploadDropZone = $('.upload-drop-zone');
const fileSelectionStatus = $('#file-selection-status');
if (uploadFileInput && uploadDropZone) {
  const clearDragState = (event) => {
    event.preventDefault();
    uploadDropZone.classList.remove('is-dragging');
  };
  uploadDropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      uploadFileInput.click();
    }
  });
  for (const eventName of ['dragenter', 'dragover']) {
    uploadDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      uploadDropZone.classList.add('is-dragging');
    });
  }
  for (const eventName of ['dragleave', 'dragend']) uploadDropZone.addEventListener(eventName, clearDragState);
  uploadDropZone.addEventListener('drop', (event) => {
    clearDragState(event);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    uploadFileInput.files = transfer.files;
    uploadFileInput.dispatchEvent(new Event('change', { bubbles: true }));
  });
  uploadFileInput.addEventListener('change', () => {
    const file = uploadFileInput.files?.[0];
    if (fileSelectionStatus) fileSelectionStatus.textContent = file ? `Ausgewählt: ${file.name}` : '';
  });
}

$('#upload-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const file = $('#document-file').files[0];
  if (!file) return;
  setBusy(form, true);
  try {
    const data = new FormData();
    data.append('file', file);
    await api('/api/admin/documents', { method: 'POST', body: data });
    form.reset();
    await loadDocuments();
    showNotice('PDF wurde geschützt gespeichert und ist zunächst nur für den Admin sichtbar.', 'success');
  } catch (error) { showNotice(error.message, 'error'); }
  finally { setBusy(form, false); }
});

$('#grant-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  setBusy(form, true);
  try {
    const email = $('#grant-email').value.trim();
    await api(`/api/admin/users/${encodeURIComponent(email)}/access`, { method: 'PUT', body: JSON.stringify({ enabled: true }) });
    form.reset();
    await loadUsers();
    showNotice('Manus-Konto freigegeben. Die Person muss sich mit genau dieser E-Mail anmelden.', 'success');
  } catch (error) { showNotice(error.message, 'error'); }
  finally { setBusy(form, false); }
});

$('#close-document').addEventListener('click', () => $('#document-dialog').close());
$('#document-dialog').addEventListener('click', (event) => {
  if (event.target === $('#document-dialog')) $('#document-dialog').close();
});
$('#document-dialog').addEventListener('close', () => $('#document-frame').removeAttribute('src'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && $('#document-dialog').open) $('#document-dialog').close();
});

async function refreshStatus() {
  try {
    const result = await api('/api/auth/status');
    if (!result.authenticated) {
      currentUser = null;
      authPanel.hidden = true;
      privatePanel.hidden = true;
      adminPanel.hidden = true;
      loginPanel.hidden = false;
      return;
    }
    renderAuth(result);
  } catch (error) {
    loginPanel.hidden = false;
    showNotice(error.message, 'error');
  }
}

const authMessages = {
  success: 'Du bist angemeldet.',
  cancelled: 'Die Manus-Anmeldung wurde abgebrochen.',
  not_allowed: 'Dieses Manus-Konto ist noch nicht freigegeben. Bitte wende dich an den Admin.',
  state_error: 'Die Anmeldung konnte aus Sicherheitsgründen nicht bestätigt werden. Bitte erneut starten.',
  unavailable: 'Die Anmeldung ist derzeit nicht verfügbar. Bitte versuche es später erneut.',
  logout: 'Du wurdest abgemeldet.',
  idle: 'Deine Sitzung wurde nach Inaktivität beendet.'
};
const authMessage = authMessages[new URLSearchParams(location.search).get('auth')];
if (authMessage) showNotice(authMessage, ['success', 'logout'].includes(new URLSearchParams(location.search).get('auth')) ? 'success' : 'info');
refreshStatus();
