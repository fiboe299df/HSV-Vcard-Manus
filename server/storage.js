// The managed GET /v1/storage/presign/get contract issues download URLs valid for one hour.
export const PRIVATE_DOWNLOAD_TTL_SECONDS = 60 * 60;

function storageConfig() {
  const base = process.env.MANUS_API_URL?.replace(/\/+$/, '');
  const key = process.env.MANUS_API_KEY;
  if (!base || !key) throw new Error('Managed storage credentials are unavailable');
  return { base, key };
}

async function presign(kind, objectKey) {
  if (!/^[\x20-\x7e]+$/.test(objectKey) || objectKey.length > 512) throw new Error('Invalid storage path');
  const { base, key } = storageConfig();
  const url = new URL(`${base}/v1/storage/presign/${kind}`);
  url.searchParams.set('path', objectKey);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(15000)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.url !== 'string') throw new Error(`Storage presign failed (${response.status})`);
  return body.url;
}

export async function uploadPrivateObject(objectKey, bytes, mimeType) {
  if (!Buffer.isBuffer(bytes)) throw new TypeError('Storage upload requires a Buffer');
  const signedUrl = await presign('put', objectKey);
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType },
    body: bytes,
    signal: AbortSignal.timeout(60000)
  });
  if (!response.ok) throw new Error(`Private storage upload failed (${response.status})`);
  return { sizeBytes: bytes.length };
}

export async function createPrivateDownloadUrl(objectKey) {
  return presign('get', objectKey);
}

export async function verifyStoredObject(objectKey, expectedBytes) {
  const signedUrl = await createPrivateDownloadUrl(objectKey);
  const response = await fetch(signedUrl, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Private storage verification failed (${response.status})`);
  const actual = Buffer.from(await response.arrayBuffer());
  if (actual.length !== expectedBytes.length || !actual.equals(expectedBytes)) throw new Error('Private storage content verification failed');
  return actual.length;
}
