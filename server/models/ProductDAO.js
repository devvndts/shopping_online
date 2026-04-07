require("../utils/MongooseUtil");
const Models = require("./Models");

const ProductDAO = {
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
    const mongoose = require("mongoose");
    product._id = new mongoose.Types.ObjectId();
    const result = await Models.Product.create(product);
    return result;
  },

  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },

  async update(product) {
    const newvalues = {
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || '',
      category: product.category,
    };

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

   async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
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
   async selectByCatID(_cid) {
    const query = { 'category._id': _cid };
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByCatIDLimited(_cid, limit) {
    const query = { 'category._id': _cid };
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
    const query = { name: { $regex: new RegExp(keyword, 'i') } };
    const products = await Models.Product.find(query).exec();
    return products;
  }
  ,
  async selectAllMinimal() {
    const rows = await Models.Product.find({})
      .select({ _id: 1, name: 1 })
      .lean()
      .exec();
    return rows || [];
  }
};

module.exports = ProductDAO;
