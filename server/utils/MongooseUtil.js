const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');

const uri =
  'mongodb+srv://' +
  MyConstants.DB_USER +
  ':' +
  MyConstants.DB_PASS +
  '@' +
  MyConstants.DB_SERVER +
  '/' +
  MyConstants.DB_DATABASE;

mongoose
  .connect(uri)
  .then(() => {
    console.log(
      'Connected to ' +
        MyConstants.DB_SERVER +
        '/' +
        MyConstants.DB_DATABASE
    );

    // Hotfix: trước đây Order embed ProductSchema (và các schema liên quan) nên Mongo có thể tạo
    // unique index sai trên các field dưới orders.items.product.* → gây lỗi E11000 khi đặt nhiều đơn.
    // Drop tất cả unique index nằm dưới items.product.* nếu tồn tại.
    (async () => {
      try {
        const coll = mongoose.connection.collection('orders');
        const indexes = await coll.indexes();
        const bad = (indexes || []).filter((idx) => {
          if (!idx || !idx.name || !idx.key) return false;
          const keys = Object.keys(idx.key || {});
          const touchesOrderItemProduct = keys.some((k) =>
            String(k).startsWith('items.product.')
          );
          return touchesOrderItemProduct && idx.unique === true;
        });

        for (const idx of bad) {
          try {
            await coll.dropIndex(idx.name);
            console.log('[mongo] Dropped bad unique index:', idx.name);
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    })();
  })
  .catch((err) => {
    console.error(err);
  });
