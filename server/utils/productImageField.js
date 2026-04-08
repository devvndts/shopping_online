const { isConfigured, uploadImageBuffer } = require('./firebaseStorage');

function looksLikeHttpUrl(s) {
  return /^https?:\/\//i.test(String(s || '').trim());
}

/**
 * Ảnh sản phẩm trong Mongo chỉ là URL (Firebase hoặc link ngoài).
 * - Có file upload → upload Firebase (bắt buộc đã cấu hình Firebase).
 * - Hoặc imageUrl (http/https) từ body.
 * - Sửa sản phẩm: không đổi file / không gửi URL mới → giữ previousImage.
 */
async function resolveProductImageForDb({
  fileBuffer,
  fileMimetype,
  imageUrl,
  previousImage,
  isCreate,
}) {
  if (fileBuffer && fileBuffer.length) {
    if (!isConfigured()) {
      throw new Error(
        'Firebase chưa cấu hình — không thể upload ảnh. Cấu hình service account hoặc nhập URL ảnh có sẵn.',
      );
    }
    const ct =
      fileMimetype && /^image\//i.test(String(fileMimetype))
        ? String(fileMimetype)
        : 'application/octet-stream';
    if (!/^image\//i.test(ct)) {
      throw new Error('File phải là ảnh (image/*).');
    }
    return uploadImageBuffer(fileBuffer, ct, 'products');
  }

  const url = imageUrl != null ? String(imageUrl).trim() : '';
  if (looksLikeHttpUrl(url)) return url;

  const prev = previousImage != null ? String(previousImage).trim() : '';
  if (!isCreate && prev) return prev;

  throw new Error(
    isCreate
      ? 'Vui lòng chọn file ảnh hoặc nhập URL ảnh (http/https).'
      : 'Vui lòng chọn ảnh mới hoặc nhập URL ảnh (http/https); hoặc giữ nguyên không xóa ảnh hiện tại.',
  );
}

module.exports = {
  resolveProductImageForDb,
  looksLikeHttpUrl,
};
