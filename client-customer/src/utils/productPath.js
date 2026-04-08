/**
 * Đường dẫn chi tiết sản phẩm: ưu tiên slug (chuẩn SEO), fallback _id cho dữ liệu cũ.
 */
export function productPath(item) {
  if (!item || !item._id) return '/home';
  const slug = item.slug != null ? String(item.slug).trim() : '';
  if (slug) return '/product/' + encodeURIComponent(slug);
  return '/product/' + item._id;
}
