const express = require('express');
const multer = require('multer');
const router = express.Router();

const JwtUtil = require('../utils/JwtUtil');

const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const BrandDAO = require('../models/BrandDAO');
const ProductDAO = require('../models/ProductDAO');
const PromoDAO = require('../models/PromoDAO');
const { slugify } = require('../utils/slugify');
const {
  resolveProductImageForDb,
  looksLikeHttpUrl,
} = require('../utils/productImageField');
const { isConfigured, uploadImageBuffer } = require('../utils/firebaseStorage');
const { resolveGalleryFromRequest, MAX_GALLERY } = require('../utils/productGallery');

const uploadImageMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: MAX_GALLERY },
]);
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');
const SettingDAO = require('../models/SettingDAO');
const SlideDAO = require('../models/SlideDAO');
const ReviewDAO = require('../models/ReviewDAO');
router.post('/login', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(
      username,
      password
    );

    if (admin) {
      const token = JwtUtil.genToken(username, password);

      res.json({
        success: true,
        message: 'Authentication successful',
        token: token,
      });
    } else {
      res.json({
        success: false,
        message: 'Incorrect username or password',
      });
    }
  } else {
    res.json({
      success: false,
      message: 'Please input username and password',
    });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token =
    req.headers['x-access-token'] || req.headers['authorization'];

  res.json({
    success: true,
    message: 'Token is valid',
    token: token,
  });
});

router.get('/categories', JwtUtil.checkToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});
router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const slugBase = slugify(name);
  const slug = await CategoryDAO.ensureUniqueSlug(slugBase, null);
  const category = { name: name, slug: slug };
  const result = await CategoryDAO.insert(category);
  res.json(result);
});
router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const slugBase = slugify(name);
  const slug = await CategoryDAO.ensureUniqueSlug(slugBase, _id);
  const category = { _id: _id, name: name, slug: slug };
  const result = await CategoryDAO.update(category);
  res.json(result);
});
router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

router.get('/brands', JwtUtil.checkToken, async function (req, res) {
  const brands = await BrandDAO.selectAll();
  res.json(brands);
});

router.post('/brands', JwtUtil.checkToken, async function (req, res) {
  const name = (req.body.name != null ? String(req.body.name) : '').trim();
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tên thương hiệu.',
    });
  }
  const dup = await BrandDAO.selectByName(name);
  if (dup) {
    return res.status(409).json({
      success: false,
      message: 'Thương hiệu này đã tồn tại.',
    });
  }
  const result = await BrandDAO.insert({ name });
  res.json(result);
});

router.put('/brands/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = (req.body.name != null ? String(req.body.name) : '').trim();
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập tên thương hiệu.',
    });
  }
  const existing = await BrandDAO.selectByName(name);
  if (existing && String(existing._id) !== String(_id)) {
    return res.status(409).json({
      success: false,
      message: 'Tên thương hiệu đã được dùng cho bản ghi khác.',
    });
  }
  const result = await BrandDAO.update({ _id, name });
  res.json(result);
});

router.delete('/brands/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await BrandDAO.delete(_id);
  res.json(result);
});

// ===== Promo codes =====
router.get('/promos', JwtUtil.checkToken, async function (req, res) {
  const rows = await PromoDAO.selectAll();
  res.json(rows);
});

router.post('/promos', JwtUtil.checkToken, async function (req, res) {
  const rawCode = req.body.code;
  const code = PromoDAO.normalizeCode(rawCode);
  if (!code) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã (code).' });
  }
  const dup = await PromoDAO.selectByCode(code);
  if (dup) {
    return res.status(409).json({ success: false, message: 'Mã khuyến mãi đã tồn tại.' });
  }
  try {
    const row = await PromoDAO.insert({
      ...req.body,
      code,
    });
    res.json(row);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Không tạo được mã.' });
  }
});

router.put('/promos/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  if (!_id) return res.status(400).json({ success: false, message: 'Thiếu id.' });
  const rawCode = req.body.code;
  const code = PromoDAO.normalizeCode(rawCode);
  if (!code) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã (code).' });
  }
  const existing = await PromoDAO.selectByCode(code);
  if (existing && String(existing._id) !== String(_id)) {
    return res.status(409).json({ success: false, message: 'Code đã được dùng cho mã khác.' });
  }
  try {
    const row = await PromoDAO.update({ ...req.body, _id, code });
    res.json(row);
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Không cập nhật được mã.' });
  }
});

router.delete('/promos/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  if (!_id) return res.status(400).json({ success: false, message: 'Thiếu id.' });
  const row = await PromoDAO.delete(_id);
  if (row) return res.json(row);
  res.status(404).json({ success: false, message: 'Không tìm thấy mã.' });
});

router.get('/products', JwtUtil.checkToken, async function (req, res) {
  const noProducts = await ProductDAO.selectByCount();
  const sizePage = 10;
  const noPages = Math.ceil(noProducts / sizePage);
  var curPage = 1;
  if (req.query.page) curPage = parseInt(req.query.page);
  const skip = (curPage - 1) * sizePage;
  const products = await ProductDAO.selectBySkipLimit(skip, sizePage);
  const result = { products: products, noPages: noPages, curPage: curPage };
  res.json(result);
});

router.get('/products/all', JwtUtil.checkToken, async function (req, res) {
  const rows = await ProductDAO.selectAllMinimal();
  res.json(rows);
});
router.post(
  '/products',
  JwtUtil.checkToken,
  uploadProductImages,
  async function (req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const description = req.body.description || '';
  const brand = (req.body.brand != null ? String(req.body.brand) : '').trim();
  const imageUrl = (req.body.imageUrl != null ? String(req.body.imageUrl) : '').trim();
  const mainFile = req.files && req.files.image && req.files.image[0];
  let image;
  let gallery;
  try {
    image = await resolveProductImageForDb({
      fileBuffer: mainFile && mainFile.buffer,
      fileMimetype: mainFile && mainFile.mimetype,
      imageUrl,
      previousImage: '',
      isCreate: true,
    });
    gallery = await resolveGalleryFromRequest(req);
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message || 'Không xử lý được ảnh.',
    });
  }
  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu ảnh sản phẩm.',
    });
  }
  const now = new Date().getTime();
  const category = await CategoryDAO.selectByID(cid);
  const slugBase = slugify(name);
  const slug = await ProductDAO.ensureUniqueSlug(slugBase, null);
  const product = {
    name: name,
    brand: brand,
    slug: slug,
    price: price,
    image: image,
    gallery,
    description: description,
    cdate: now,
    category: category,
  };
  const result = await ProductDAO.insert(product);
  res.json(result);
});

router.put(
  '/products/:id',
  JwtUtil.checkToken,
  uploadProductImages,
  async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const description = req.body.description || '';
  const brand = (req.body.brand != null ? String(req.body.brand) : '').trim();
  const now = new Date().getTime();
  const imageUrl = (req.body.imageUrl != null ? String(req.body.imageUrl) : '').trim();

  const existing = await ProductDAO.selectByID(_id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm.',
    });
  }
  const mainFile = req.files && req.files.image && req.files.image[0];
  let image;
  let gallery;
  try {
    image = await resolveProductImageForDb({
      fileBuffer: mainFile && mainFile.buffer,
      fileMimetype: mainFile && mainFile.mimetype,
      imageUrl,
      previousImage: existing.image,
      isCreate: false,
    });
    gallery = await resolveGalleryFromRequest(req);
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message || 'Không xử lý được ảnh.',
    });
  }
  if (!image) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu ảnh sản phẩm.',
    });
  }

  const category = await CategoryDAO.selectByID(cid);
  const slugBase = slugify(name);
  const slug = await ProductDAO.ensureUniqueSlug(slugBase, _id);
  const product = {
    _id: _id,
    name: name,
    brand: brand,
    slug: slug,
    price: price,
    image: image,
    gallery,
    description: description,
    cdate: now,
    category: category,
  };

  const result = await ProductDAO.update(product);
  res.json(result);
});
router.delete('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await ProductDAO.delete(_id);
  res.json(result);
});

router.get('/customers', JwtUtil.checkToken, async function (req, res) {
  const customers = await CustomerDAO.selectAll();
  res.json(customers);
});

router.post('/customers', JwtUtil.checkToken, async function (req, res) {
  const username = (req.body.username || '').trim();
  const password = req.body.password;
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  const email = (req.body.email || '').trim();
  const active = req.body.active;

  if (!username || !password || !name || !phone || !email) {
    return res.status(400).json({
      success: false,
      message:
        'Vui lòng nhập đủ tên đăng nhập, mật khẩu, họ tên, điện thoại, email.',
    });
  }

  const exists = await CustomerDAO.selectByUsernameOrEmail(username, email);
  if (exists) {
    return res.status(409).json({
      success: false,
      message: 'Tên đăng nhập hoặc email đã tồn tại.',
    });
  }

  const result = await CustomerDAO.insertAdmin({
    username,
    password: String(password),
    name,
    phone,
    email,
    active,
  });

  if (result) {
    res.json(result);
  } else {
    res.status(500).json({ success: false, message: 'Không thể tạo khách hàng.' });
  }
});

router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const username = (req.body.username || '').trim();
  const password = req.body.password;
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  const email = (req.body.email || '').trim();
  const active = req.body.active;

  if (!username || !name || !phone || !email) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đủ tên đăng nhập, họ tên, điện thoại, email.',
    });
  }

  const conflict = await CustomerDAO.existsUsernameOrEmailExceptId(
    username,
    email,
    _id
  );
  if (conflict) {
    return res.status(409).json({
      success: false,
      message: 'Tên đăng nhập hoặc email đã được dùng bởi tài khoản khác.',
    });
  }

  const customer = {
    _id: _id,
    username,
    password: password != null ? String(password) : '',
    name,
    phone,
    email,
    active,
  };

  const result = await CustomerDAO.updateForAdmin(customer);
  if (result) {
    res.json(result);
  } else {
    res
      .status(404)
      .json({ success: false, message: 'Không tìm thấy khách hàng.' });
  }
});

router.patch(
  '/customers/:id/active',
  JwtUtil.checkToken,
  async function (req, res) {
    const _id = req.params.id;
    const raw = req.body.active;
    const active =
      raw === 1 ||
      raw === true ||
      raw === '1' ||
      raw === 'true'
        ? 1
        : 0;

    const result = await CustomerDAO.setActive(_id, active);
    if (result) {
      res.json(result);
    } else {
      res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy khách hàng.' });
    }
  }
);

router.delete('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await CustomerDAO.delete(_id);
  if (result) {
    res.json(result);
  } else {
    res
      .status(404)
      .json({ success: false, message: 'Không tìm thấy khách hàng.' });
  }
});

router.get('/orders', JwtUtil.checkToken, async function (req, res) {
  const orders = await OrderDAO.selectAll();
  res.json(orders);
});

router.get('/orders/summary', JwtUtil.checkToken, async function (req, res) {
  const summary = await OrderDAO.selectSummary();
  res.json(summary);
});

router.patch('/orders/:id/status', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const status = req.body.status;
  if (!_id) return res.status(400).json({ success: false, message: 'Thiếu id.' });
  if (!status) return res.status(400).json({ success: false, message: 'Thiếu status.' });
  const row = await OrderDAO.setStatus(_id, status);
  if (row) return res.json({ success: true, order: row });
  res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });
});

// ===== UI Settings =====
router.get('/settings/auth-hero-bg', JwtUtil.checkToken, async function (req, res) {
  const row = await SettingDAO.getByKey('authHeroBg');
  const imageUrl = resolveSettingImageUrlForAdmin(row, 'authHeroBg');
  res.json({
    imageUrl: imageUrl || '',
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.put(
  '/settings/auth-hero-bg',
  JwtUtil.checkToken,
  uploadImageMemory.single('image'),
  async function (req, res) {
    try {
      let imageUrl = (req.body.imageUrl || '').trim();
      if (req.file && req.file.buffer && req.file.buffer.length) {
        if (!isConfigured()) {
          return res.status(400).json({
            success: false,
            message: 'Firebase chưa cấu hình — không thể upload ảnh.',
          });
        }
        if (!/^image\//i.test(req.file.mimetype || '')) {
          return res.status(400).json({ success: false, message: 'File phải là ảnh.' });
        }
        imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'settings');
      }
      if (!looksLikeHttpUrl(imageUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file ảnh hoặc nhập URL ảnh (http/https).',
        });
      }
      const row = await SettingDAO.upsertAuthHeroBgByUrl(imageUrl);
      res.json({ success: true, imageUrl: row.imageUrl, updatedAt: row.updatedAt });
    } catch (e) {
      res.status(400).json({
        success: false,
        message: e.message || 'Không lưu được ảnh.',
      });
    }
  }
);

router.get('/settings/site-logo', JwtUtil.checkToken, async function (req, res) {
  const row = await SettingDAO.getByKey('siteLogo');
  const imageUrl = resolveSettingImageUrlForAdmin(row, 'siteLogo');
  res.json({
    imageUrl: imageUrl || '',
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.put(
  '/settings/site-logo',
  JwtUtil.checkToken,
  uploadImageMemory.single('image'),
  async function (req, res) {
    try {
      let imageUrl = (req.body.imageUrl || '').trim();
      if (req.file && req.file.buffer && req.file.buffer.length) {
        if (!isConfigured()) {
          return res.status(400).json({
            success: false,
            message: 'Firebase chưa cấu hình — không thể upload ảnh.',
          });
        }
        if (!/^image\//i.test(req.file.mimetype || '')) {
          return res.status(400).json({ success: false, message: 'File phải là ảnh.' });
        }
        imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'settings');
      }
      if (!looksLikeHttpUrl(imageUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file ảnh hoặc nhập URL ảnh (http/https).',
        });
      }
      const row = await SettingDAO.upsertSiteLogoByUrl(imageUrl);
      res.json({ success: true, imageUrl: row.imageUrl, updatedAt: row.updatedAt });
    } catch (e) {
      res.status(400).json({
        success: false,
        message: e.message || 'Không lưu được ảnh.',
      });
    }
  }
);

router.get('/settings/site-favicon', JwtUtil.checkToken, async function (req, res) {
  const row = await SettingDAO.getByKey('siteFavicon');
  const imageUrl = resolveSettingImageUrlForAdmin(row, 'siteFavicon');
  res.json({
    imageUrl: imageUrl || '',
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.put(
  '/settings/site-favicon',
  JwtUtil.checkToken,
  uploadImageMemory.single('image'),
  async function (req, res) {
    try {
      let imageUrl = (req.body.imageUrl || '').trim();
      let mime = '';
      let data = '';

      if (req.file && req.file.buffer && req.file.buffer.length) {
        if (!/^image\//i.test(req.file.mimetype || '')) {
          return res.status(400).json({ success: false, message: 'File phải là ảnh.' });
        }
        if (isConfigured()) {
          imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'settings');
          mime = '';
          data = '';
        } else {
          // Fallback: lưu base64 trong Mongo (legacy proxy URL)
          imageUrl = '';
          mime = req.file.mimetype;
          data = Buffer.from(req.file.buffer).toString('base64');
        }
      } else {
        // URL mode
        if (!looksLikeHttpUrl(imageUrl)) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng chọn file ảnh hoặc nhập URL ảnh (http/https).',
          });
        }
        mime = '';
        data = '';
      }

      const row = await SettingDAO.upsertImageByKey({
        key: 'siteFavicon',
        imageUrl,
        mime,
        data,
      });
      const urlForAdmin = resolveSettingImageUrlForAdmin(row, 'siteFavicon');
      res.json({ success: true, imageUrl: urlForAdmin || '', updatedAt: row.updatedAt || Date.now() });
    } catch (e) {
      res.status(400).json({
        success: false,
        message: e.message || 'Không lưu được favicon.',
      });
    }
  }
);

router.get('/settings/site-title', JwtUtil.checkToken, async function (req, res) {
  const row = await SettingDAO.getByKey('siteTitle');
  res.json({
    title: (row && row.data) || '',
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.put('/settings/site-title', JwtUtil.checkToken, async function (req, res) {
  try {
    const title = (req.body && req.body.title != null ? String(req.body.title) : '').trim();
    if (!title) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề (title).' });
    }
    const row = await SettingDAO.upsertTextByKey('siteTitle', title);
    res.json({ success: true, title: row.data || title, updatedAt: row.updatedAt || Date.now() });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message || 'Không lưu được title.' });
  }
});

/** URL hiển thị cho admin: Firebase / URL đã lưu / proxy legacy (không trả base64 trong JSON). */
function resolveSettingImageUrlForAdmin(row, kind) {
  if (!row) return '';
  const u = (row.imageUrl || '').trim();
  if (looksLikeHttpUrl(u)) return u;
  if (row.data && row.mime) {
    const path =
      kind === 'siteLogo'
        ? 'site-logo-image'
        : kind === 'siteFavicon'
          ? 'site-favicon-image'
          : 'auth-hero-bg-image';
    return `/api/customer/settings/${path}?v=${row.updatedAt || 0}`;
  }
  return '';
}

// ===== Home slides =====
router.get('/slides', JwtUtil.checkToken, async function (req, res) {
  const rows = await SlideDAO.selectAll();
  res.json(rows);
});

router.post(
  '/slides',
  JwtUtil.checkToken,
  uploadImageMemory.single('image'),
  async function (req, res) {
    const title = req.body.title || '';
    const subtitle = req.body.subtitle || '';
    const href = req.body.href || '';
    const active = req.body.active;
    const sort = req.body.sort;

    let imageUrl = '';
    try {
      if (req.file && req.file.buffer && req.file.buffer.length) {
        if (!isConfigured()) {
          return res.status(400).json({
            success: false,
            message: 'Firebase chưa cấu hình — không thể upload ảnh.',
          });
        }
        if (!/^image\//i.test(req.file.mimetype || '')) {
          return res.status(400).json({ success: false, message: 'File phải là ảnh.' });
        }
        imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'slides');
      } else {
        const u = (req.body.imageUrl || '').trim();
        if (looksLikeHttpUrl(u)) imageUrl = u;
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message || 'Không upload được ảnh.',
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh hoặc nhập URL ảnh (http/https).',
      });
    }

    const row = await SlideDAO.insert({ title, subtitle, href, imageUrl, active, sort });
    res.json(row);
  }
);

router.put(
  '/slides/:id',
  JwtUtil.checkToken,
  uploadImageMemory.single('image'),
  async function (req, res) {
    const _id = req.params.id;
    const title = req.body.title || '';
    const subtitle = req.body.subtitle || '';
    const href = req.body.href || '';
    const active = req.body.active;
    const sort = req.body.sort;

    if (!_id) return res.status(400).json({ success: false, message: 'Thiếu id.' });

    const existing = await SlideDAO.selectById(_id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy slide.' });
    }

    let imageUrl;
    try {
      if (req.file && req.file.buffer && req.file.buffer.length) {
        if (!isConfigured()) {
          return res.status(400).json({
            success: false,
            message: 'Firebase chưa cấu hình — không thể upload ảnh.',
          });
        }
        if (!/^image\//i.test(req.file.mimetype || '')) {
          return res.status(400).json({ success: false, message: 'File phải là ảnh.' });
        }
        imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'slides');
      } else {
        const u = (req.body.imageUrl || '').trim();
        if (looksLikeHttpUrl(u)) imageUrl = u;
      }
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: e.message || 'Không upload được ảnh.',
      });
    }

    const slide = { _id, title, subtitle, href, active, sort };
    if (imageUrl) slide.imageUrl = imageUrl;

    const hadImage =
      !!(existing.imageUrl || '').trim() ||
      !!(existing.imageMime && existing.imageData);
    if (!imageUrl && !hadImage) {
      return res.status(400).json({ success: false, message: 'Slide cần có ảnh.' });
    }

    const row = await SlideDAO.update(slide);
    res.json(row);
  }
);

router.delete('/slides/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const row = await SlideDAO.delete(_id);
  if (row) return res.json(row);
  res.status(404).json({ success: false, message: 'Không tìm thấy slide.' });
});

// ===== Reviews =====
router.get('/reviews', JwtUtil.checkToken, async function (req, res) {
  const rows = await ReviewDAO.selectAll();
  res.json(rows);
});

router.post('/reviews', JwtUtil.checkToken, async function (req, res) {
  const productId = (req.body.productId || '').trim();
  const productName = (req.body.productName || '').trim();
  const author = (req.body.author || '').trim();
  const stars = req.body.stars;
  const content = (req.body.content || '').trim();
  const active = req.body.active;

  if (!productId || !productName || !author || !content) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin đánh giá.' });
  }
  const row = await ReviewDAO.insert({ productId, productName, author, stars, content, active });
  res.json(row);
});

router.put('/reviews/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const productId = (req.body.productId || '').trim();
  const productName = (req.body.productName || '').trim();
  const author = (req.body.author || '').trim();
  const stars = req.body.stars;
  const content = (req.body.content || '').trim();
  const active = req.body.active;

  if (!_id) return res.status(400).json({ success: false, message: 'Thiếu id.' });
  if (!productId || !productName || !author || !content) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đủ thông tin đánh giá.' });
  }
  const row = await ReviewDAO.update({ _id, productId, productName, author, stars, content, active });
  res.json(row);
});

router.patch('/reviews/:id/active', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const raw = req.body.active;
  const active =
    raw === 1 || raw === true || raw === '1' || raw === 'true'
      ? 1
      : 0;
  const row = await ReviewDAO.setActive(_id, active);
  if (row) return res.json(row);
  res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
});

router.delete('/reviews/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const row = await ReviewDAO.delete(_id);
  if (row) return res.json(row);
  res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
});

module.exports = router;
