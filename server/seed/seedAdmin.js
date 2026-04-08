require('../loadEnv');
/**
 * Chạy: từ thư mục server — npm run seed:admin
 * Tạo admin nếu chưa có, hoặc ghi đè mật khẩu về giá trị mặc định.
 *
 * Tuỳ chọn môi trường:
 *   ADMIN_USER, ADMIN_PASS
 */
const mongoose = require('mongoose');
const MyConstants = require('../utils/MyConstants');
const { ensureDefaultAdmin } = require('./ensureAdmin');

const uri =
  'mongodb+srv://' +
  MyConstants.DB_USER +
  ':' +
  MyConstants.DB_PASS +
  '@' +
  MyConstants.DB_SERVER +
  '/' +
  MyConstants.DB_DATABASE;

async function main() {
  await mongoose.connect(uri);
  await ensureDefaultAdmin({ updateOnlyIfMissing: false });
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
