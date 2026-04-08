const { looksLikeHttpUrl } = require('./productImageField');
const { isConfigured, uploadImageBuffer } = require('./firebaseStorage');

const MAX_GALLERY = 12;

function parseGalleryUrlList(raw) {
  if (raw == null || raw === '') return [];
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return [];
    const out = [];
    const seen = new Set();
    for (const x of arr) {
      const u = String(x || '').trim();
      if (!looksLikeHttpUrl(u)) continue;
      if (seen.has(u)) continue;
      seen.add(u);
      out.push(u);
      if (out.length >= MAX_GALLERY) break;
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * galleryUrls: JSON mảng URL từ client; files field "gallery" — upload Firebase, nối sau URLs.
 */
async function resolveGalleryFromRequest(req) {
  const fromJson = parseGalleryUrlList(req.body.galleryUrls);
  const galleryFiles =
    req.files && req.files.gallery
      ? Array.isArray(req.files.gallery)
        ? req.files.gallery
        : [req.files.gallery]
      : [];
  if (galleryFiles.length && !isConfigured()) {
    throw new Error(
      'Firebase chưa cấu hình — không thể upload ảnh gallery. Thêm URL https vào danh sách hoặc cấu hình Firebase.',
    );
  }
  const uploaded = [];
  for (const f of galleryFiles) {
    if (!f || !f.buffer || !f.mimetype || !/^image\//i.test(f.mimetype)) continue;
    uploaded.push(await uploadImageBuffer(f.buffer, f.mimetype, 'products'));
    if (fromJson.length + uploaded.length >= MAX_GALLERY) break;
  }
  return [...fromJson, ...uploaded].slice(0, MAX_GALLERY);
}

module.exports = {
  parseGalleryUrlList,
  resolveGalleryFromRequest,
  MAX_GALLERY,
};
