const express = require('express');
const router = express.Router();

const JwtUtil = require('../utils/JwtUtil');

const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
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
  const category = { name: name };
  const result = await CategoryDAO.insert(category);
  res.json(result);
});
router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const category = { _id: _id, name: name };
  const result = await CategoryDAO.update(category);
  res.json(result);
});
router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

router.get('/products', JwtUtil.checkToken, async function (req, res) {
  const noProducts = await ProductDAO.selectByCount();
  const sizePage = 4;
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
router.post('/products', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const description = req.body.description || '';
  const now = new Date().getTime();
  const category = await CategoryDAO.selectByID(cid);
  const product = { name: name, price: price, image: image, description: description, cdate: now, category: category };
  const result = await ProductDAO.insert(product);
  res.json(result);
});

router.put('/products/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const price = req.body.price;
  const cid = req.body.category;
  const image = req.body.image;
  const description = req.body.description || '';
  const now = new Date().getTime();

  const category = await CategoryDAO.selectByID(cid);
  const product = {
    _id: _id,
    name: name,
    price: price,
    image: image,
    description: description,
    cdate: now,
    category: category
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
  if (!row || !row.data) {
    return res.json({ mime: '', data: '', updatedAt: 0 });
  }
  res.json({ mime: row.mime || '', data: row.data || '', updatedAt: row.updatedAt || 0 });
});

router.put('/settings/auth-hero-bg', JwtUtil.checkToken, async function (req, res) {
  const mime = (req.body.mime || '').trim();
  const data = (req.body.data || '').trim();

  if (!mime || !data) {
    return res.status(400).json({ success: false, message: 'Vui lòng tải ảnh (mime + data).' });
  }
  if (!/^image\//i.test(mime)) {
    return res.status(400).json({ success: false, message: 'Chỉ hỗ trợ file ảnh.' });
  }

  const row = await SettingDAO.upsertAuthHeroBg({ mime, data });
  res.json({ success: true, ...row });
});

router.get('/settings/site-logo', JwtUtil.checkToken, async function (req, res) {
  const row = await SettingDAO.getByKey('siteLogo');
  if (!row || !row.data) {
    return res.json({ mime: '', data: '', updatedAt: 0 });
  }
  res.json({ mime: row.mime || '', data: row.data || '', updatedAt: row.updatedAt || 0 });
});

router.put('/settings/site-logo', JwtUtil.checkToken, async function (req, res) {
  const mime = (req.body.mime || '').trim();
  const data = (req.body.data || '').trim();

  if (!mime || !data) {
    return res.status(400).json({ success: false, message: 'Vui lòng tải ảnh (mime + data).' });
  }
  if (!/^image\//i.test(mime)) {
    return res.status(400).json({ success: false, message: 'Chỉ hỗ trợ file ảnh.' });
  }

  const row = await SettingDAO.upsertSiteLogo({ mime, data });
  res.json({ success: true, ...row });
});

// ===== Home slides =====
router.get('/slides', JwtUtil.checkToken, async function (req, res) {
  const rows = await SlideDAO.selectAll();
  res.json(rows);
});

router.post('/slides', JwtUtil.checkToken, async function (req, res) {
  const title = req.body.title || '';
  const subtitle = req.body.subtitle || '';
  const href = req.body.href || '';
  const imageMime = (req.body.imageMime || '').trim();
  const imageData = (req.body.imageData || '').trim();
  const active = req.body.active;
  const sort = req.body.sort;

  if (!imageMime || !imageData) {
    return res.status(400).json({ success: false, message: 'Vui lòng tải ảnh slide.' });
  }
  if (!/^image\//i.test(imageMime)) {
    return res.status(400).json({ success: false, message: 'Chỉ hỗ trợ file ảnh.' });
  }

  const row = await SlideDAO.insert({ title, subtitle, href, imageMime, imageData, active, sort });
  res.json(row);
});

router.put('/slides/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const title = req.body.title || '';
  const subtitle = req.body.subtitle || '';
  const href = req.body.href || '';
  const imageMime = (req.body.imageMime || '').trim();
  const imageData = (req.body.imageData || '').trim();
  const active = req.body.active;
  const sort = req.body.sort;

  if (!_id) return res.status(400).json({ success: false, message: 'Thiếu id.' });
  if (!imageMime || !imageData) {
    return res.status(400).json({ success: false, message: 'Vui lòng tải ảnh slide.' });
  }
  if (!/^image\//i.test(imageMime)) {
    return res.status(400).json({ success: false, message: 'Chỉ hỗ trợ file ảnh.' });
  }

  const row = await SlideDAO.update({ _id, title, subtitle, href, imageMime, imageData, active, sort });
  res.json(row);
});

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
