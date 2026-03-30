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
};

module.exports = OrderDAO;
