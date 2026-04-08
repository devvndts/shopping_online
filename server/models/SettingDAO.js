require('../utils/MongooseUtil');
const Models = require('./Models');

const SettingDAO = {
  async getByKey(key) {
    if (!key) return null;
    const row = await Models.Setting.findOne({ key }).lean().exec();
    return row || null;
  },

  async upsertAuthHeroBgByUrl(imageUrl) {
    const key = 'authHeroBg';
    const updatedAt = Date.now();
    const url = String(imageUrl || '').trim();
    const payload = {
      key,
      imageUrl: url,
      mime: '',
      data: '',
      updatedAt,
    };
    const result = await Models.Setting.findOneAndUpdate(
      { key },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
    ).exec();
    return result || null;
  },

  async upsertSiteLogoByUrl(imageUrl) {
    const key = 'siteLogo';
    const updatedAt = Date.now();
    const url = String(imageUrl || '').trim();
    const payload = {
      key,
      imageUrl: url,
      mime: '',
      data: '',
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
