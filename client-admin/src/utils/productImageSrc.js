/** Hiển thị ảnh sản phẩm: URL hoặc legacy (chuỗi base64 cũ trong DB — không gửi base64 qua API mới). */
export function productImageSrc(image) {
  if (image == null || image === '') return '';
  const s = String(image).trim();
  if (/^https?:\/\//i.test(s)) return s;
  return 'data:image/jpeg;base64,' + s;
}
