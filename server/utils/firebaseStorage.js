const crypto = require('crypto');
const admin = require('firebase-admin');

let initAttempted = false;
let loggedMissingFirebase = false;

function getCredential() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim()) {
    try {
      return JSON.parse(rawJson);
    } catch {
      return null;
    }
  }
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) return null;
  privateKey = privateKey.replace(/\\n/g, '\n');
  return {
    type: 'service_account',
    project_id: projectId,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'key',
    private_key: privateKey,
    client_email: clientEmail,
    client_id: process.env.FIREBASE_CLIENT_ID || '',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  };
}

/** gs://bucket/name → bucket; bỏ path thừa. */
function normalizeStorageBucket(raw) {
  if (!raw || !String(raw).trim()) return '';
  let s = String(raw).trim();
  if (s.toLowerCase().startsWith('gs://')) s = s.slice(5);
  return s.split('/')[0].trim();
}

function ensureApp() {
  if (admin.apps.length) return admin.app();
  if (initAttempted) return null;
  initAttempted = true;
  const cred = getCredential();
  if (!cred || !cred.project_id) {
    if (!loggedMissingFirebase) {
      loggedMissingFirebase = true;
      console.warn(
        '[firebase] Chưa cấu hình upload: đặt FIREBASE_* trong server/.env (mẫu: server/.env.example). Hoặc trong admin chỉ nhập URL ảnh https, không upload file.',
      );
    }
    return null;
  }
  const fromEnv = normalizeStorageBucket(process.env.FIREBASE_STORAGE_BUCKET);
  // Bucket mặc định cũ: {project}.appspot.com — bucket mới thường là {project}.firebasestorage.app → nên set FIREBASE_STORAGE_BUCKET.
  const bucket = fromEnv || `${cred.project_id}.appspot.com`;
  admin.initializeApp({
    credential: admin.credential.cert(cred),
    storageBucket: bucket,
  });
  return admin.app();
}

function isConfigured() {
  return ensureApp() != null;
}

function bufferMime(buf) {
  if (!buf || buf.length < 12) return 'image/jpeg';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return 'image/png';
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif';
  if (
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'image/webp';
  }
  return 'image/jpeg';
}

function mimeToExt(mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('png')) return '.png';
  if (m.includes('gif')) return '.gif';
  if (m.includes('webp')) return '.webp';
  return '.jpg';
}

const SAFE_FOLDER = /^[a-z0-9-_]+$/i;

/**
 * Upload buffer ảnh → Firebase Storage. folder: ví dụ products | slides | settings
 */
async function uploadImageBuffer(buffer, contentType, folder) {
  const app = ensureApp();
  if (!app) {
    throw new Error('Firebase chưa cấu hình (thiếu biến môi trường service account).');
  }
  if (!buffer || !buffer.length) throw new Error('Dữ liệu ảnh trống.');
  const f = String(folder || 'uploads').split('/')[0];
  if (!SAFE_FOLDER.test(f)) throw new Error('Tên thư mục upload không hợp lệ.');
  let ct =
    contentType && /^image\//i.test(String(contentType))
      ? String(contentType)
      : bufferMime(buffer);
  if (!/^image\//i.test(ct)) ct = 'image/jpeg';
  const ext = mimeToExt(ct);
  const name = `${f}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const bucket = admin.storage().bucket();
  const fileRef = bucket.file(name);
  await fileRef.save(buffer, {
    resumable: false,
    metadata: {
      contentType: ct,
      cacheControl: 'public, max-age=31536000',
    },
  });
  try {
    await fileRef.makePublic();
  } catch {
    // Uniform bucket-level access: đọc qua Storage Rules
  }
  return `https://storage.googleapis.com/${bucket.name}/${name}`;
}

/** Dùng cho seed/script: base64 thuần → upload (không lưu base64 vào Mongo). */
async function uploadProductImageFromBase64(base64Body) {
  const clean = String(base64Body || '').replace(/\s/g, '');
  if (!clean) throw new Error('Dữ liệu ảnh trống.');
  let buffer;
  try {
    buffer = Buffer.from(clean, 'base64');
  } catch {
    throw new Error('Ảnh không đúng định dạng base64.');
  }
  if (!buffer.length) throw new Error('Ảnh không đúng định dạng base64.');
  return uploadImageBuffer(buffer, bufferMime(buffer), 'products');
}

module.exports = {
  isConfigured,
  uploadImageBuffer,
  uploadProductImageFromBase64,
};
