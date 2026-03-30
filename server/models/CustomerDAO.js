require("../utils/MongooseUtil");
const Models = require("./Models");

function toSafeLean(c) {
  if (!c) return null;
  return {
    _id: c._id,
    username: c.username,
    name: c.name,
    phone: c.phone,
    email: c.email,
    active: c.active,
  };
}

const CustomerDAO = {
  async selectByUsernameOrEmail(username, email) {
    const query = { $or: [{ username: username }, { email: email }] };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },

  /** Trùng username hoặc email với tài khoản khác (dùng khi sửa). */
  async existsUsernameOrEmailExceptId(username, email, excludeId) {
    const query = {
      $or: [{ username }, { email }],
    };
    if (excludeId) query._id = { $ne: excludeId };
    const found = await Models.Customer.findOne(query).lean();
    return !!found;
  },

  async insert(customer) {
    const mongoose = require("mongoose");
    customer._id = new mongoose.Types.ObjectId();
    const result = await Models.Customer.create(customer);
    return result;
  },

  /** Admin tạo KH: mặc định active = 1, có token (tương thích luồng cũ). */
  async insertAdmin({ username, password, name, phone, email, active }) {
    const CryptoUtil = require("../utils/CryptoUtil");
    const mongoose = require("mongoose");
    const inactive =
      active === 0 ||
      active === false ||
      active === "0" ||
      active === "false";
    const doc = {
      _id: new mongoose.Types.ObjectId(),
      username,
      password,
      name,
      phone,
      email,
      active: inactive ? 0 : 1,
      token: CryptoUtil.md5(Date.now().toString()),
    };
    const result = await Models.Customer.create(doc);
    return result ? toSafeLean(result.toObject()) : null;
  },
  async active(_id, token, active) {
    const query = { _id: _id, token: token };
    const newvalues = { active: active };

    const result = await Models.Customer.findOneAndUpdate(query, newvalues, {
      new: true,
    });

    return result;
  },
  async selectByUsernameAndPassword(username, password) {
    const query = { username: username, password: password };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },
  async selectAll() {
    const list = await Models.Customer.find({}).lean().exec();
    return list.map((c) => ({
      _id: c._id,
      username: c.username,
      name: c.name,
      phone: c.phone,
      email: c.email,
      active: c.active,
    }));
  },

  async update(customer) {
    const newvalues = {
      username: customer.username,
      password: customer.password,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    };

    const result = await Models.Customer.findByIdAndUpdate(
      customer._id,
      newvalues,
      { new: true },
    );

    return result;
  },

  /** Cập nhật từ admin: đổi mật khẩu chỉ khi chuỗi không rỗng. */
  async updateForAdmin(customer) {
    const newvalues = {
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    };
    if (customer.active !== undefined && customer.active !== null) {
      const off =
        customer.active === 0 ||
        customer.active === false ||
        customer.active === "0" ||
        customer.active === "false";
      newvalues.active = off ? 0 : 1;
    }
    if (
      customer.password != null &&
      String(customer.password).trim() !== ""
    ) {
      newvalues.password = customer.password;
    }
    const result = await Models.Customer.findByIdAndUpdate(
      customer._id,
      newvalues,
      { new: true, lean: true },
    );
    return toSafeLean(result);
  },

  async setActive(_id, active) {
    const val = active === 1 || active === true ? 1 : 0;
    const result = await Models.Customer.findByIdAndUpdate(
      _id,
      { active: val },
      { new: true, lean: true },
    );
    return toSafeLean(result);
  },

  async delete(_id) {
    const result = await Models.Customer.findByIdAndDelete(_id).lean();
    return toSafeLean(result);
  },
};

module.exports = CustomerDAO;

