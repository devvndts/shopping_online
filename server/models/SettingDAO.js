require('../utils/MongooseUtil');
const Models = require('./Models');

const SettingDAO = {
  async getByKey(key) {
    if (!key) return null;
    const row = await Models.Setting.findOne({ key }).lean().exec();
    return row || null;
  },

  async upsertTextByKey(key, text) {
    if (!key) return null;
    const updatedAt = Date.now();
    const payload = {
      key: String(key),
      imageUrl: '',
      mime: '',
      data: String(text != null ? text : '').trim(),
      updatedAt,
    };
    const result = await Models.Setting.findOneAndUpdate(
      { key: payload.key },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
    ).exec();
    return result || null;
  },

  async upsertImageByKey({ key, imageUrl, mime, data }) {
    if (!key) return null;
    const updatedAt = Date.now();
    const safeUrl = String(imageUrl || '').trim();
    const safeMime = String(mime || '').trim();
    const safeData = String(data || '').trim();
    const payload = {
      key: String(key),
      imageUrl: safeUrl,
      mime: safeMime,
      data: safeData,
      updatedAt,
    };
    const result = await Models.Setting.findOneAndUpdate(
      { key: payload.key },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true, lean: true }
    ).exec();
    return result || null;
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
