const mongoose = require('mongoose');
const Models = require('../models/Models');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');

/**
 * Index unique cũ trên products.category.slug (do dùng chung CategorySchema) — sai về mặt dữ liệu.
 */
async function dropErroneousProductCategorySlugIndex() {
  try {
    await Models.Product.collection.dropIndex('category.slug_1');
    console.log(
      '[db] Dropped invalid unique index category.slug_1 on products (many items share category slug).',
    );
  } catch (err) {
    const code = err && err.code;
    const msg = String((err && err.message) || '');
    if (code === 27 || msg.includes('index not found') || msg.includes('ns not found')) {
      return;
    }
    console.warn('[db] Could not drop category.slug_1 index:', msg);
  }
}

/**
 * Sau khi DB kết nối: bù slug danh mục trước, rồi sản phẩm (idempotent mỗi lần start).
 */
function scheduleSlugBackfills() {
  const run = () => {
    dropErroneousProductCategorySlugIndex()
      .then(() => CategoryDAO.backfillMissingSlugs())
      .then((n) => {
        if (n > 0) {
          console.log(
            `[categories] Slug backfill: ${n} document(s) updated.`,
          );
        }
      })
      .then(() => ProductDAO.backfillMissingSlugs())
      .then((n) => {
        if (n > 0) {
          console.log(`[products] Slug backfill: ${n} document(s) updated.`);
        }
      })
      .catch((err) => {
        console.error('[slug] Backfill failed:', err);
      });
  };
  if (mongoose.connection.readyState === 1) {
    run();
  } else {
    mongoose.connection.once('connected', run);
  }
}

module.exports = scheduleSlugBackfills;
