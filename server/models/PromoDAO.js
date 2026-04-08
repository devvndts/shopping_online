require('../utils/MongooseUtil');
const mongoose = require('mongoose');
const Models = require('./Models');

function normalizeCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function computeDiscount(promo, subtotal) {
  const sub = Math.max(0, safeNumber(subtotal, 0));
  if (!promo) return { discount: 0, reason: 'NO_PROMO' };
  if (promo.active !== 1) return { discount: 0, reason: 'INACTIVE' };

  const now = Date.now();
  if (promo.startAt && now < Number(promo.startAt)) return { discount: 0, reason: 'NOT_STARTED' };
  if (promo.endAt && now > Number(promo.endAt)) return { discount: 0, reason: 'EXPIRED' };
  if (promo.minSubtotal && sub < Number(promo.minSubtotal)) return { discount: 0, reason: 'MIN_SUBTOTAL' };

  const type = String(promo.type || '').toUpperCase();
  let d = 0;
  if (type === 'PERCENT') {
    const pct = Math.max(0, Math.min(100, safeNumber(promo.value, 0)));
    d = Math.round((sub * pct) / 100);
  } else if (type === 'FIXED') {
    d = Math.max(0, safeNumber(promo.value, 0));
  } else {
    return { discount: 0, reason: 'BAD_TYPE' };
  }

  if (promo.maxDiscount != null && promo.maxDiscount !== '') {
    const cap = Math.max(0, safeNumber(promo.maxDiscount, d));
    d = Math.min(d, cap);
  }
  d = Math.min(d, sub);
  return { discount: d, reason: 'OK' };
}

const PromoDAO = {
  normalizeCode,
  computeDiscount,

  async selectByCode(code) {
    const c = normalizeCode(code);
    if (!c) return null;
    const row = await Models.Promo.findOne({ code: c }).lean().exec();
    return row || null;
  },

  async selectApplicable(subtotal, limit = 6) {
    const sub = Math.max(0, safeNumber(subtotal, 0));
    const now = Date.now();
    const rows = await Models.Promo.find({
      active: 1,
      $and: [
        { $or: [{ startAt: 0 }, { startAt: { $exists: false } }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: 0 }, { endAt: { $exists: false } }, { endAt: { $gte: now } }] },
        { $or: [{ minSubtotal: 0 }, { minSubtotal: { $exists: false } }, { minSubtotal: { $lte: sub } }] },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(Math.max(1, Math.min(24, Number(limit) || 6)))
      .lean()
      .exec();

    // attach computed discount preview
    return (rows || []).map((p) => {
      const { discount } = computeDiscount(p, sub);
      return { ...p, discountPreview: discount };
    });
  },

  // Admin CRUD
  async selectAll() {
    const rows = await Models.Promo.find({}).sort({ updatedAt: -1 }).lean().exec();
    return rows || [];
  },

  async insert(promo) {
    const now = Date.now();
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      code: normalizeCode(promo.code),
      name: String(promo.name || '').trim(),
      description: String(promo.description || '').trim(),
      type: String(promo.type || 'PERCENT').trim().toUpperCase(),
      value: safeNumber(promo.value, 0),
      minSubtotal: safeNumber(promo.minSubtotal, 0),
      maxDiscount: promo.maxDiscount != null && promo.maxDiscount !== '' ? safeNumber(promo.maxDiscount, 0) : null,
      active: promo.active === 0 || promo.active === false ? 0 : 1,
      startAt: safeNumber(promo.startAt, 0),
      endAt: safeNumber(promo.endAt, 0),
      createdAt: now,
      updatedAt: now,
    };
    return Models.Promo.create(doc);
  },

  async update(promo) {
    const now = Date.now();
    const _id = promo._id;
    const update = {
      code: normalizeCode(promo.code),
      name: String(promo.name || '').trim(),
      description: String(promo.description || '').trim(),
      type: String(promo.type || 'PERCENT').trim().toUpperCase(),
      value: safeNumber(promo.value, 0),
      minSubtotal: safeNumber(promo.minSubtotal, 0),
      maxDiscount: promo.maxDiscount != null && promo.maxDiscount !== '' ? safeNumber(promo.maxDiscount, 0) : null,
      active: promo.active === 0 || promo.active === false ? 0 : 1,
      startAt: safeNumber(promo.startAt, 0),
      endAt: safeNumber(promo.endAt, 0),
      updatedAt: now,
    };
    return Models.Promo.findByIdAndUpdate(_id, update, { new: true }).exec();
  },

  async delete(_id) {
    return Models.Promo.findByIdAndDelete(_id).lean().exec();
  },
};

module.exports = PromoDAO;

