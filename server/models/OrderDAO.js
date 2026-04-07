require('../utils/MongooseUtil');
const Models = require('./Models');

const OrderDAO = {
  async insert(order) {
    const mongoose = require('mongoose');
    order._id = new mongoose.Types.ObjectId();
    const result = await Models.Order.create(order);
    return result;
  },
  async selectByCustID(_cid) {
    const query = { 'customer._id': _cid };
    const orders = await Models.Order.find(query).exec();
    return orders;
  },

  async selectAll() {
    const orders = await Models.Order.find({})
      .sort({ cdate: -1 })
      .lean()
      .exec();
    return orders.map((o) => {
      const c = o.customer;
      const safeCustomer = c
        ? {
            _id: c._id,
            username: c.username,
            name: c.name,
            phone: c.phone,
            email: c.email,
            active: c.active,
          }
        : null;
      return { ...o, customer: safeCustomer };
    });
  },

  async setStatus(_id, status) {
    const s = String(status || '').trim();
    const allow = ['PENDING', 'APPROVED', 'CANCELLED', 'SHIPPING', 'DONE'];
    const next = allow.includes(s) ? s : 'PENDING';
    const result = await Models.Order.findByIdAndUpdate(
      _id,
      { status: next },
      { new: true, lean: true }
    ).exec();
    return result;
  },

  async selectSummary() {
    const rows = await Models.Order.find({}).select({ total: 1, status: 1 }).lean().exec();
    const summary = {
      orders: rows.length,
      pending: 0,
      approved: 0,
      cancelled: 0,
      revenueApproved: 0,
    };
    for (const o of rows) {
      const st = String(o.status || '').toUpperCase();
      if (st === 'PENDING') summary.pending += 1;
      else if (st === 'APPROVED') {
        summary.approved += 1;
        summary.revenueApproved += Number(o.total) || 0;
      } else if (st === 'CANCELLED' || st === 'CANCELED') summary.cancelled += 1;
    }
    return summary;
  },
};

module.exports = OrderDAO;
