require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');
const { slugify } = require('../utils/slugify');

const CategoryDAO = {
  async selectAll() {
    const categories = await Models.Category.find({})
      .sort({ name: 1 })
      .exec();
    return categories;
  },

  async ensureUniqueSlug(base, excludeId) {
    let slug =
      base && String(base).trim() ? String(base).trim() : 'category';
    let counter = 0;
    while (true) {
      const query = { slug };
      if (excludeId) {
        query._id = { $ne: new mongoose.Types.ObjectId(String(excludeId)) };
      }
      const exists = await Models.Category.findOne(query).exec();
      if (!exists) return slug;
      counter += 1;
      slug = `${base}-${counter}`;
    }
  },

  async selectBySlug(slug) {
    if (!slug) return null;
    return Models.Category.findOne({ slug: String(slug) }).exec();
  },

  async insert(category) {
    category._id = new mongoose.Types.ObjectId();
    const result = await Models.Category.create(category);
    return result;
  },

  async update(category) {
    const newvalues = { name: category.name };
    if (category.slug != null && String(category.slug).trim() !== '') {
      newvalues.slug = String(category.slug).trim();
    }
    const result = await Models.Category.findByIdAndUpdate(
      category._id,
      newvalues,
      { new: true },
    );
    if (result) {
      await Models.Product.updateMany(
        { 'category._id': category._id },
        {
          $set: {
            'category.name': result.name,
            'category.slug': result.slug || '',
          },
        },
      );
    }
    return result;
  },

  async delete(_id) {
    const result = await Models.Category.findByIdAndDelete(_id);
    return result;
  },

  async selectByID(_id) {
    const category = await Models.Category.findById(_id).exec();
    return category;
  },

  async backfillMissingSlugs() {
    const query = {
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' },
      ],
    };
    const docs = await Models.Category.find(query).sort({ _id: 1 }).exec();
    let updated = 0;
    for (const doc of docs) {
      const id = doc._id;
      const base = slugify(doc.name || 'category');
      const slug = await CategoryDAO.ensureUniqueSlug(base, id);
      await Models.Category.updateOne({ _id: id }, { $set: { slug } });
      await Models.Product.updateMany(
        { 'category._id': id },
        {
          $set: {
            'category.name': doc.name,
            'category.slug': slug,
          },
        },
      );
      updated += 1;
    }
    return updated;
  },
};

module.exports = CategoryDAO;
