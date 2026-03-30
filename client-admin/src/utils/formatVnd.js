export function formatVnd(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '0\u00a0đ';
  return new Intl.NumberFormat('vi-VN').format(n) + '\u00a0đ';
}
