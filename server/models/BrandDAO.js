require('../utils/MongooseUtil');
const Models = require('./Models');

const BrandDAO = {
  async selectAll() {
    const brands = await Models.Brand.find({}).sort({ name: 1 }).exec();
    return brands;
  },
  async selectByName(name) {
    const brand = await Models.Brand.findOne({ name: name }).exec();
    return brand;
  },
  async insert(brand) {
    const mongoose = require('mongoose');
    brand._id = new mongoose.Types.ObjectId();
    const result = await Models.Brand.create(brand);
    return result;
  },
  async update(brand) {
    const newvalues = { name: brand.name };
    const result = await Models.Brand.findByIdAndUpdate(brand._id, newvalues, {
      new: true,
    });
    return result;
  },
  async delete(_id) {
    const result = await Models.Brand.findByIdAndDelete(_id);
    return result;
  },
  async selectByID(_id) {
    const brand = await Models.Brand.findById(_id).exec();
    return brand;
  },
};

module.exports = BrandDAO;
