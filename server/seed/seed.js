require('../loadEnv');
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const MyConstants = require("../utils/MyConstants");
const Models = require("../models/Models");
const { ensureDefaultAdmin } = require("./ensureAdmin");
const { slugify } = require("../utils/slugify");
const { isConfigured, uploadImageBuffer } = require("../utils/firebaseStorage");

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

/** name, price, categoryIndex, brand */
const PRODUCT_ROWS = [
  ["Laptop HP Omen 16-am0127TX", 26490000, 0, "HP"],
  ["Laptop ASUS ROG Strix G16", 32990000, 0, "ASUS"],
  ["Laptop MSI GF63 Thin 12UC", 18990000, 0, "MSI"],
  ["Laptop Lenovo Legion 5 Pro", 35990000, 0, "Lenovo"],
  ["Laptop Dell G15 5520", 21990000, 1, "Dell"],
  ["Laptop HP Pavilion 15", 15990000, 1, "HP"],
  ["Laptop Lenovo IdeaPad 3", 12990000, 1, "Lenovo"],
  ["Laptop Acer Aspire 5", 11490000, 1, "Acer"],
  ["Laptop LG Gram 16", 38990000, 2, "LG"],
  ["Laptop ASUS Zenbook 14 OLED", 27990000, 2, "ASUS"],
  ["Laptop Dell XPS 13 Plus", 42990000, 2, "Dell"],
  ["Laptop MacBook Air M2", 29990000, 2, "Apple"],
];

async function main() {
  await mongoose.connect(uri);

  const imageBuf = fs.readFileSync(PLACEHOLDER_IMAGE);
  let sharedProductImage = "";
  if (isConfigured()) {
    try {
      sharedProductImage = await uploadImageBuffer(imageBuf, "image/png", "products");
      console.log("seed: product images uploaded to Firebase Storage");
    } catch (err) {
      console.warn("seed: Firebase upload failed:", err.message);
    }
  }
  if (!sharedProductImage) {
    console.warn(
      "seed: chưa có URL ảnh (cấu hình Firebase hoặc dùng URL mẫu).",
    );
    sharedProductImage =
      process.env.SEED_PLACEHOLDER_IMAGE_URL ||
      "https://placehold.co/600x400/png?text=Product";
  }

  await Models.Product.deleteMany({});
  await Models.Category.deleteMany({});
  await Models.Brand.deleteMany({});

  const BRAND_SEED_NAMES = [
    'HP',
    'ASUS',
    'MSI',
    'Lenovo',
    'Dell',
    'Acer',
    'LG',
    'Apple',
  ];
  for (const name of BRAND_SEED_NAMES) {
    await Models.Brand.create({
      _id: new mongoose.Types.ObjectId(),
      name,
    });
  }

  const categories = [];
  for (const name of CATEGORIES) {
    const doc = await Models.Category.create({
      _id: new mongoose.Types.ObjectId(),
      name,
      slug: slugify(name),
    });
    categories.push(doc);
  }

  let ts = Date.now();
  const slugCount = {};
  for (const row of PRODUCT_ROWS) {
    const name = row[0];
    const price = row[1];
    const catIdx = row[2];
    const brand = row[3] || "";
    const cat = categories[catIdx];
    ts -= 7200000;
    const base = slugify(name);
    slugCount[base] = (slugCount[base] || 0) + 1;
    const slug =
      slugCount[base] === 1 ? base : `${base}-${slugCount[base]}`;
    await Models.Product.create({
      _id: new mongoose.Types.ObjectId(),
      name,
      brand,
      slug,
      price,
      image: sharedProductImage,
      gallery: [],
      cdate: ts,
      category: {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug || slugify(cat.name),
      },
    });
  }

  await ensureDefaultAdmin({ updateOnlyIfMissing: true });

  await mongoose.disconnect();
  console.log(
    'seed done:',
    categories.length,
    'categories,',
    BRAND_SEED_NAMES.length,
    'brands,',
    PRODUCT_ROWS.length,
    'products',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
