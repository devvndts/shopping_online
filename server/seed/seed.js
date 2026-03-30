const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const MyConstants = require("../utils/MyConstants");
const Models = require("../models/Models");
const { ensureDefaultAdmin } = require("./ensureAdmin");

const uri =
  "mongodb+srv://" +
  MyConstants.DB_USER +
  ":" +
  MyConstants.DB_PASS +
  "@" +
  MyConstants.DB_SERVER +
  "/" +
  MyConstants.DB_DATABASE;

const PLACEHOLDER_IMAGE = path.join(
  __dirname,
  "..",
  "..",
  "client-customer",
  "public",
  "logo192.png",
);

const CATEGORIES = [
  "Laptop gaming",
  "Laptop văn phòng",
  "Laptop mỏng nhẹ",
];

const PRODUCT_ROWS = [
  ["Laptop HP Omen 16-am0127TX", 26490000, 0],
  ["Laptop ASUS ROG Strix G16", 32990000, 0],
  ["Laptop MSI GF63 Thin 12UC", 18990000, 0],
  ["Laptop Lenovo Legion 5 Pro", 35990000, 0],
  ["Laptop Dell G15 5520", 21990000, 1],
  ["Laptop HP Pavilion 15", 15990000, 1],
  ["Laptop Lenovo IdeaPad 3", 12990000, 1],
  ["Laptop Acer Aspire 5", 11490000, 1],
  ["Laptop LG Gram 16", 38990000, 2],
  ["Laptop ASUS Zenbook 14 OLED", 27990000, 2],
  ["Laptop Dell XPS 13 Plus", 42990000, 2],
  ["Laptop MacBook Air M2", 29990000, 2],
];

async function main() {
  await mongoose.connect(uri);

  const imageB64 = fs.readFileSync(PLACEHOLDER_IMAGE).toString("base64");

  await Models.Product.deleteMany({});
  await Models.Category.deleteMany({});

  const categories = [];
  for (const name of CATEGORIES) {
    const doc = await Models.Category.create({
      _id: new mongoose.Types.ObjectId(),
      name,
    });
    categories.push(doc);
  }

  let ts = Date.now();
  for (const [name, price, catIdx] of PRODUCT_ROWS) {
    const cat = categories[catIdx];
    ts -= 7200000;
    await Models.Product.create({
      _id: new mongoose.Types.ObjectId(),
      name,
      price,
      image: imageB64,
      cdate: ts,
      category: { _id: cat._id, name: cat.name },
    });
  }

  await ensureDefaultAdmin({ updateOnlyIfMissing: true });

  await mongoose.disconnect();
  console.log(
    "seed done:",
    categories.length,
    "categories,",
    PRODUCT_ROWS.length,
    "products",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
