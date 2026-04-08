/** Chuỗi an toàn khi đưa vào RegExp (tránh lỗi khi user gõ \\, *, ...). */
function escapeRegex(str) {
  return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { escapeRegex };
