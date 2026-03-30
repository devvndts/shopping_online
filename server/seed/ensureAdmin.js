const mongoose = require('mongoose');
const Models = require('../models/Models');

/**
 * Tạo admin mặc định nếu chưa có (dùng sau seed dữ liệu).
 * API: POST /api/admin/login — so khớp username + password trực tiếp trong DB.
 *
 * @param {{ updateOnlyIfMissing?: boolean }} opts
 *   updateOnlyIfMissing=true (mặc định): chỉ insert khi chưa có user đó.
 *   false: luôn ghi đè mật khẩu (chạy `npm run seed:admin`).
 */
async function ensureDefaultAdmin(opts = {}) {
  const updateOnlyIfMissing = opts.updateOnlyIfMissing !== false;

  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'admin123';

  let doc = await Models.Admin.findOne({ username });
  if (!doc) {
    await Models.Admin.create({
      _id: new mongoose.Types.ObjectId(),
      username,
      password,
    });
    console.log(
      '[admin] Đã tạo tài khoản — đăng nhập:',
      username,
      '/',
      password
    );
    return;
  }

  if (updateOnlyIfMissing) {
    console.log(
      '[admin] Đã có tài khoản "' +
        username +
        '" — giữ nguyên mật khẩu. Chạy `npm run seed:admin` để đặt lại mật khẩu mặc định.'
    );
    return;
  }

  doc.password = password;
  await doc.save();
  console.log(
    '[admin] Đã cập nhật mật khẩu mặc định —',
    username,
    '/',
    password
  );
}

module.exports = { ensureDefaultAdmin };
