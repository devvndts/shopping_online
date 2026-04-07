const express = require("express");
const router = express.Router();

const CryptoUtil = require("../utils/CryptoUtil");
const EmailUtil = require("../utils/EmailUtil");
const JwtUtil = require('../utils/JwtUtil');
const CategoryDAO = require("../models/CategoryDAO");
const ProductDAO = require("../models/ProductDAO");
const OrderDAO = require('../models/OrderDAO');
const SettingDAO = require('../models/SettingDAO');
const SlideDAO = require('../models/SlideDAO');
const ReviewDAO = require('../models/ReviewDAO');

const CustomerDAO = require("../models/CustomerDAO");

router.get("/categories", async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.get("/products/new", async function (req, res) {
  var top = parseInt(req.query.limit, 10);
  if (!top || top < 1) top = 5;
  if (top > 24) top = 24;
  const products = await ProductDAO.selectTopNew(top);
  res.json(products);
});

router.get("/products/hot", async function (req, res) {
  const products = await ProductDAO.selectTopHot(3);
  res.json(products);
});
router.get("/products/category/:cid", async function (req, res) {
  const _cid = req.params.cid;
  var lim = parseInt(req.query.limit, 10);
  const products =
    lim && lim > 0
      ? await ProductDAO.selectByCatIDLimited(_cid, lim)
      : await ProductDAO.selectByCatID(_cid);
  res.json(products);
});
router.get("/products/search/:keyword", async function (req, res) {
  const keyword = req.params.keyword;
  const products = await ProductDAO.selectByKeyword(keyword);
  res.json(products);
});
router.get("/products/:id", async function (req, res) {
  const _id = req.params.id;
  const product = await ProductDAO.selectByID(_id);
  res.json(product);
});

router.post('/signup', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;

  const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);

  if (dbCust) {
    res.json({ success: false, message: 'Exists username or email' });
  } else {
    const now = new Date().getTime();
    const token = CryptoUtil.md5(now.toString());

    const newCust = {
      username: username,
      password: password,
      name: name,
      phone: phone,
      email: email,
      active: 0,
      token: token
    };

    const result = await CustomerDAO.insert(newCust);

    if (result) {
      const send = await EmailUtil.send(email, result._id, token);

      if (send) {
        res.json({ success: true, message: 'Please check email' });
      } else {
        res.json({ success: false, message: 'Email failure' });
      }
    } else {
      res.json({ success: false, message: 'Insert failure' });
    }
  }
});

router.post("/active", async function (req, res) {
  const _id = req.body.id;
  const token = req.body.token;

  const result = await CustomerDAO.active(_id, token, 1);

  res.json(result);
});

router.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const customer = await CustomerDAO.selectByUsernameAndPassword(
      username,
      password,
    );

    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken();

        res.json({
          success: true,
          message: "Authentication successful",
          token: token,
          customer: customer,
        });
      } else {
        res.json({ success: false, message: "Account is deactive" });
      }
    } else {
      res.json({ success: false, message: "Incorrect username or password" });
    }
  } else {
    res.json({ success: false, message: "Please input username and password" });
  }
});

router.get("/token", JwtUtil.checkToken, function (req, res) {
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  res.json({
    success: true,
    message: "Token is valid",
    token: token,
  });
});

router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {

  const _id = req.params.id;

  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;

  const customer = {
    _id: _id,
    username: username,
    password: password,
    name: name,
    phone: phone,
    email: email
  };

  const result = await CustomerDAO.update(customer);

  res.json(result);

});

router.post('/checkout', JwtUtil.checkToken, async function (req, res) {

  const now = new Date().getTime();
  const total = req.body.total;
  const items = req.body.items;
  const customer = req.body.customer;

  const order = {
    cdate: now,
    total: total,
    status: 'PENDING',
    customer: customer,
    items: items
  };

  const result = await OrderDAO.insert(order);

  res.json(result);
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});

// Public UI settings
router.get('/settings/auth-hero-bg', async function (req, res) {
  const row = await SettingDAO.getByKey('authHeroBg');
  if (!row || !row.data) {
    return res.json({ mime: '', data: '', updatedAt: 0 });
  }
  res.json({ mime: row.mime || '', data: row.data || '', updatedAt: row.updatedAt || 0 });
});

router.get('/settings/site-logo', async function (req, res) {
  const row = await SettingDAO.getByKey('siteLogo');
  if (!row || !row.data) {
    return res.json({ mime: '', data: '', updatedAt: 0 });
  }
  res.json({ mime: row.mime || '', data: row.data || '', updatedAt: row.updatedAt || 0 });
});

router.get('/slides', async function (req, res) {
  // return metadata only (faster than embedding base64 in JSON)
  const rows = await SlideDAO.selectActiveMeta();
  res.json(rows);
});

router.get('/slides/:id/image', async function (req, res) {
  const _id = req.params.id;
  const row = await SlideDAO.selectImageById(_id);
  if (!row || !row.imageMime || !row.imageData) {
    return res.status(404).end();
  }
  try {
    const buf = Buffer.from(String(row.imageData), 'base64');
    res.setHeader('Content-Type', row.imageMime);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    if (row.updatedAt) res.setHeader('ETag', String(row.updatedAt));
    res.end(buf);
  } catch {
    res.status(500).end();
  }
});

router.get('/reviews/product/:pid', async function (req, res) {
  const pid = req.params.pid;
  const rows = await ReviewDAO.selectActiveByProductId(pid);
  res.json(rows);
});

// Customer submit review (pending approval)
router.post('/reviews', JwtUtil.checkToken, async function (req, res) {
  const productId = (req.body.productId || '').trim();
  const productName = (req.body.productName || '').trim();
  const author = (req.body.author || '').trim();
  const stars = req.body.stars;
  const content = (req.body.content || '').trim();

  if (!productId || !productName || !content) {
    return res
      .status(400)
      .json({ success: false, message: 'Thiếu thông tin đánh giá.' });
  }
  if (content.length < 8) {
    return res
      .status(400)
      .json({ success: false, message: 'Nội dung đánh giá quá ngắn.' });
  }

  const safeAuthor = author || (req.decoded && req.decoded.username) || 'Khách hàng';

  const row = await ReviewDAO.insert({
    productId,
    productName,
    author: safeAuthor,
    stars,
    content,
    active: 0, // pending approval
  });
  res.json({ success: true, review: row });
});
module.exports = router;
