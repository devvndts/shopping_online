/** Đường dẫn tương đối trên site khách: ưu tiên slug, fallback _id. */
export function customerProductPath(item) {
  if (!item || !item._id) return '/home';
  const slug = item.slug != null ? String(item.slug).trim() : '';
  if (slug) return '/product/' + encodeURIComponent(slug);
  return '/product/' + encodeURIComponent(String(item._id));
}

/** Danh sách theo danh mục trên site khách. */
export function customerCategoryPath(cat) {
  if (!cat || !cat._id) return '/home';
  const slug = cat.slug != null ? String(cat.slug).trim() : '';
  if (slug) return '/product/category/' + encodeURIComponent(slug);
  return '/product/category/' + encodeURIComponent(String(cat._id));
}
