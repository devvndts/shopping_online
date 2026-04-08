/** Đường dẫn danh sách theo danh mục: ưu tiên slug, fallback _id. */
export function categoryPath(cat) {
  if (!cat || !cat._id) return '/home';
  const slug = cat.slug != null ? String(cat.slug).trim() : '';
  if (slug) return '/product/category/' + encodeURIComponent(slug);
  return '/product/category/' + encodeURIComponent(String(cat._id));
}
