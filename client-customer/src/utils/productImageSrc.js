/** Hiển thị ảnh sản phẩm: URL (Firebase/CDN) hoặc legacy base64 trong DB. */
export function productImageSrc(image) {
  if (image == null || image === '') return '';
  const s = String(image).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return 'data:image/jpeg;base64,' + s;
}
