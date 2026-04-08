/**
 * Chạy một lần: bù slug danh mục + sản phẩm chưa có slug, rồi thoát.
 *   npm run backfill:slugs
 */
require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');

function waitConnected() {
  return new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
      return;
    }
    mongoose.connection.once('connected', resolve);
    mongoose.connection.once('error', reject);
  });
}

async function main() {
  await waitConnected();
  const nc = await CategoryDAO.backfillMissingSlugs();
  const np = await ProductDAO.backfillMissingSlugs();
  console.log(`Done. Categories: ${nc}, products: ${np}.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
