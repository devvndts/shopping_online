require("../utils/MongooseUtil");
const mongoose = require("mongoose");
const Models = require("./Models");
const CategoryDAO = require("./CategoryDAO");
const { slugify, isLikelyMongoObjectId } = require("../utils/slugify");
const { escapeRegex } = require("../utils/regexEscape");

const ProductDAO = {
  slugify,

  async resolveCategoryId(cidOrSlug) {
    if (cidOrSlug == null || String(cidOrSlug).trim() === '') return null;
    const raw = String(cidOrSlug).trim();
    if (isLikelyMongoObjectId(raw)) return raw;
    const cat = await CategoryDAO.selectBySlug(
      decodeURIComponent(raw),
    );
    return cat && cat._id ? String(cat._id) : null;
  },

  async ensureUniqueSlug(base, excludeId) {
    let slug = base && String(base).trim() ? String(base).trim() : "product";
    let counter = 0;
    while (true) {
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: new mongoose.Types.ObjectId(String(excludeId)) };
      }
      const exists = await Models.Product.findOne(query).exec();
      if (!exists) return slug;
      counter += 1;
      slug = `${base}-${counter}`;
    }
  },

  async selectBySlug(slug) {
    if (!slug) return null;
    const product = await Models.Product.findOne({ slug: String(slug) })
      .lean()
      .exec();
    return product;
  },

  async selectByCount() {
    const query = {};
    const noProducts = await Models.Product.countDocuments(query).exec();
    return noProducts;
  },

  async selectBySkipLimit(skip, limit) {
    const products = await Models.Product.find({})
      .skip(skip)
      .limit(limit)
      .exec();
    return products;
  },

  async insert(product) {
    product._id = new mongoose.Types.ObjectId();
    const result = await Models.Product.create(product);
    return result;
  },

  async selectByID(_id) {
    const product = await Models.Product.findById(_id).lean().exec();
    return product;
  },

  async update(product) {
    const newvalues = {
      name: product.name,
      brand: product.brand != null ? product.brand : '',
      price: product.price,
      image: product.image,
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
      description: product.description || '',
      category: product.category,
    };
    if (product.slug != null && String(product.slug).trim() !== '') {
      newvalues.slug = String(product.slug).trim();
    }

    const result = await Models.Product.findByIdAndUpdate(
      product._id,
      newvalues,
      { new: true },
    );

    return result;
  },

  async delete(_id) {
    const result = await Models.Product.findByIdAndDelete(_id);
    return result;
  },

  async selectTopNew(top) {
    const query = {};
    const mysort = { cdate: -1 };
    const products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return products;
  },

  async selectTopHot(top) {
    const items = await Models.Order.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
      { $sort: { sum: -1 } }, // descending
      { $limit: top }
    ]).exec();

    var products = [];
    for (const item of items) {
      const product = await ProductDAO.selectByID(item._id);
      products.push(product);
    }
    return products;
  },
  async selectByCatID(cidOrSlug) {
    const id = await ProductDAO.resolveCategoryId(cidOrSlug);
    if (!id) return [];
    const query = { 'category._id': id };
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByCatIDLimited(cidOrSlug, limit) {
    const id = await ProductDAO.resolveCategoryId(cidOrSlug);
    if (!id) return [];
    const query = { 'category._id': id };
    var lim = parseInt(limit, 10);
    if (!lim || lim < 1) lim = 8;
    if (lim > 48) lim = 48;
    const products = await Models.Product.find(query)
      .sort({ cdate: -1 })
      .limit(lim)
      .exec();
    return products;
  },
  async selectByKeyword(keyword) {
    const safe = escapeRegex(keyword);
    if (!safe) {
      return [];
    }
    const query = { name: { $regex: new RegExp(safe, 'i') } };
    const products = await Models.Product.find(query).exec();
    return products;
  }
  ,
  async selectAllMinimal() {
    const rows = await Models.Product.find({})
      .select({ _id: 1, name: 1, slug: 1 })
      .lean()
      .exec();
    return rows || [];
  },

  /** Gán slug cho sản phẩm chưa có (dữ liệu cũ). Trả về số bản ghi đã cập nhật. */
  async backfillMissingSlugs() {
    const query = {
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' },
      ],
    };
    const docs = await Models.Product.find(query).sort({ _id: 1 }).exec();
    let updated = 0;
    for (const doc of docs) {
      const id = doc._id;
      const base = slugify(doc.name || 'product');
      const slug = await ProductDAO.ensureUniqueSlug(base, id);
      await Models.Product.updateOne({ _id: id }, { $set: { slug } });
      updated += 1;
    }
    return updated;
  },
};

module.exports = ProductDAO;
