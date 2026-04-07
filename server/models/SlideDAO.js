require('../utils/MongooseUtil');
const Models = require('./Models');

function toSafe(s) {
  if (!s) return null;
  return {
    _id: s._id,
    title: s.title || '',
    subtitle: s.subtitle || '',
    href: s.href || '',
    imageMime: s.imageMime || '',
    imageData: s.imageData || '',
    active: s.active === 1 ? 1 : 0,
    sort: typeof s.sort === 'number' ? s.sort : 0,
    updatedAt: s.updatedAt || 0,
  };
}

function toMeta(s) {
  if (!s) return null;
  return {
    _id: s._id,
    title: s.title || '',
    subtitle: s.subtitle || '',
    href: s.href || '',
    imageMime: s.imageMime || '',
    active: s.active === 1 ? 1 : 0,
    sort: typeof s.sort === 'number' ? s.sort : 0,
    updatedAt: s.updatedAt || 0,
    hasImage: !!(s.imageMime && s.imageData),
  };
}

const SlideDAO = {
  async selectAll() {
    const rows = await Models.Slide.find({})
      .sort({ sort: 1, updatedAt: -1 })
      .lean()
      .exec();
    return (rows || []).map(toSafe);
  },

  async selectActive() {
    const rows = await Models.Slide.find({ active: 1 })
      .sort({ sort: 1, updatedAt: -1 })
      .lean()
      .exec();
    return (rows || []).map(toSafe);
  },

  async selectActiveMeta() {
    const rows = await Models.Slide.find({ active: 1 })
      .select({ _id: 1, title: 1, subtitle: 1, href: 1, imageMime: 1, imageData: 1, active: 1, sort: 1, updatedAt: 1 })
      .sort({ sort: 1, updatedAt: -1 })
      .lean()
      .exec();
    return (rows || []).map(toMeta);
  },

  async selectImageById(_id) {
    const row = await Models.Slide.findById(_id)
      .select({ imageMime: 1, imageData: 1, updatedAt: 1 })
      .lean()
      .exec();
    if (!row) return null;
    return {
      imageMime: row.imageMime || '',
      imageData: row.imageData || '',
      updatedAt: row.updatedAt || 0,
    };
  },

  async insert(slide) {
    const mongoose = require('mongoose');
    const now = Date.now();
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      title: (slide.title || '').trim(),
      subtitle: (slide.subtitle || '').trim(),
      href: (slide.href || '').trim(),
      imageMime: (slide.imageMime || '').trim(),
      imageData: (slide.imageData || '').trim(),
      active: slide.active === 0 ? 0 : 1,
      sort: Number.isFinite(slide.sort) ? slide.sort : parseInt(slide.sort, 10) || 0,
      updatedAt: now,
    };
    const result = await Models.Slide.create(doc);
    return result ? toSafe(result.toObject()) : null;
  },

  async update(slide) {
    const now = Date.now();
    const newvalues = {
      title: (slide.title || '').trim(),
      subtitle: (slide.subtitle || '').trim(),
      href: (slide.href || '').trim(),
      imageMime: (slide.imageMime || '').trim(),
      imageData: (slide.imageData || '').trim(),
      active: slide.active === 0 ? 0 : 1,
      sort: Number.isFinite(slide.sort) ? slide.sort : parseInt(slide.sort, 10) || 0,
      updatedAt: now,
    };
    const result = await Models.Slide.findByIdAndUpdate(slide._id, newvalues, {
      new: true,
      lean: true,
    }).exec();
    return toSafe(result);
  },

  async delete(_id) {
    const result = await Models.Slide.findByIdAndDelete(_id).lean().exec();
    return toSafe(result);
  },
};

module.exports = SlideDAO;

