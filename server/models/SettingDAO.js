require('../utils/MongooseUtil');
const Models = require('./Models');

const SettingDAO = {
  async getByKey(key) {
    if (!key) return null;
    const row = await Models.Setting.findOne({ key }).lean().exec();
    return row || null;
  },

  async upsertAuthHeroBg({ mime, data }) {
    const key = 'authHeroBg';
    const updatedAt = Date.now();
    const payload = {
      key,
      mime: mime || '',
      data: data || '',
      updatedAt,
    };
    const result = await Models.Setting.findOneAndUpdate(
      { key },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
    ).exec();
    return result || null;
  },

  async upsertSiteLogo({ mime, data }) {
    const key = 'siteLogo';
    const updatedAt = Date.now();
    const payload = {
      key,
      mime: mime || '',
      data: data || '',
      updatedAt,
    };
    const result = await Models.Setting.findOneAndUpdate(
      { key },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
    ).exec();
    return result || null;
  },
};

module.exports = SettingDAO;

