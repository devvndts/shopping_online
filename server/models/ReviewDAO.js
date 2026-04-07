require('../utils/MongooseUtil');
const Models = require('./Models');

function toSafe(r) {
  if (!r) return null;
  return {
    _id: r._id,
    productId: r.productId || '',
    productName: r.productName || '',
    author: r.author || '',
    stars: typeof r.stars === 'number' ? r.stars : 0,
    content: r.content || '',
    active: r.active === 1 ? 1 : 0,
    cdate: r.cdate || 0,
    updatedAt: r.updatedAt || 0,
  };
}

const ReviewDAO = {
  async selectAll() {
    const rows = await Models.Review.find({})
      .sort({ updatedAt: -1, cdate: -1 })
      .lean()
      .exec();
    return (rows || []).map(toSafe);
  },

  async selectActiveByProductId(productId) {
    const rows = await Models.Review.find({ productId: String(productId), active: 1 })
      .sort({ cdate: -1 })
      .lean()
      .exec();
    return (rows || []).map(toSafe);
  },

  async insert(review) {
    const mongoose = require('mongoose');
    const now = Date.now();
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      productId: String(review.productId || ''),
      productName: String(review.productName || ''),
      author: String(review.author || '').trim(),
      stars: Math.min(5, Math.max(1, parseInt(review.stars, 10) || 5)),
      content: String(review.content || '').trim(),
      active: review.active === 0 ? 0 : 1,
      cdate: now,
      updatedAt: now,
    };
    const result = await Models.Review.create(doc);
    return result ? toSafe(result.toObject()) : null;
  },

  async update(review) {
    const now = Date.now();
    const newvalues = {
      productId: String(review.productId || ''),
      productName: String(review.productName || ''),
      author: String(review.author || '').trim(),
      stars: Math.min(5, Math.max(1, parseInt(review.stars, 10) || 5)),
      content: String(review.content || '').trim(),
      active: review.active === 0 ? 0 : 1,
      updatedAt: now,
    };
    const result = await Models.Review.findByIdAndUpdate(review._id, newvalues, {
      new: true,
      lean: true,
    }).exec();
    return toSafe(result);
  },

  async setActive(_id, active) {
    const now = Date.now();
    const val = active === 1 || active === true ? 1 : 0;
    const result = await Models.Review.findByIdAndUpdate(
      _id,
      { active: val, updatedAt: now },
      { new: true, lean: true }
    ).exec();
    return toSafe(result);
  },

  async delete(_id) {
    const result = await Models.Review.findByIdAndDelete(_id).lean().exec();
    return toSafe(result);
  },
};

module.exports = ReviewDAO;

