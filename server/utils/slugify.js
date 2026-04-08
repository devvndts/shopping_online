/**
 * Chuẩn hoá chuỗi thành slug URL (chữ thường, ASCII, gạch ngang).
 * Phù hợp URL thân thiện SEO / quốc tế (RFC 3986 path segment).
 */
function slugify(input) {
  if (input == null) return '';
  let s = String(input).trim();
  s = s.replace(/\s+/g, ' ');
  s = s
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.length > 120) {
    s = s.slice(0, 120).replace(/-+$/g, '');
  }
  return s || 'product';
}

function isLikelyMongoObjectId(param) {
  return (
    typeof param === 'string' &&
    param.length === 24 &&
    /^[a-f0-9]+$/i.test(param)
  );
}

module.exports = { slugify, isLikelyMongoObjectId };
