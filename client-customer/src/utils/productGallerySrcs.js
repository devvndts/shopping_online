import { productImageSrc } from './productImageSrc';

/** Chuẩn hoá `gallery` từ API / Mongo (mảng, JSON string, hoặc object lỏng). */
export function normalizeProductGallery(gallery) {
  if (gallery == null) return [];
  if (Array.isArray(gallery)) {
    return gallery
      .map((x) => (x != null ? String(x).trim() : ''))
      .filter(Boolean);
  }
  if (typeof gallery === 'string') {
    const t = gallery.trim();
    if (!t) return [];
    try {
      const p = JSON.parse(t);
      if (Array.isArray(p)) {
        return p.map((x) => String(x || '').trim()).filter(Boolean);
      }
    } catch {
      /* ignore */
    }
    return /^https?:\/\//i.test(t) ? [t] : [];
  }
  if (typeof gallery === 'object') {
    return Object.values(gallery)
      .map((x) => (x != null ? String(x).trim() : ''))
      .filter(Boolean);
  }
  return [];
}

/** Danh sách URL hiển thị PDP: ảnh chính + gallery, không trùng lặp. */
export function productGallerySrcs(product) {
  if (!product) return [];
  const main = productImageSrc(product.image);
  const raw = normalizeProductGallery(product.gallery);
  const extra = raw.map((x) => productImageSrc(x)).filter(Boolean);
  const out = [];
  const seen = new Set();
  for (const u of [main, ...extra]) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}
