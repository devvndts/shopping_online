const express = require("express");
const router = express.Router();

const CryptoUtil = require("../utils/CryptoUtil");
const EmailUtil = require("../utils/EmailUtil");
const JwtUtil = require('../utils/JwtUtil');
const CategoryDAO = require("../models/CategoryDAO");
const ProductDAO = require("../models/ProductDAO");
const { isLikelyMongoObjectId } = require("../utils/slugify");
const OrderDAO = require('../models/OrderDAO');
const SettingDAO = require('../models/SettingDAO');
const SlideDAO = require('../models/SlideDAO');
const ReviewDAO = require('../models/ReviewDAO');
const { looksLikeHttpUrl } = require('../utils/productImageField');
const PromoDAO = require('../models/PromoDAO');

function publicSettingImageUrl(row, proxyPath) {
  if (!row) return '';
  const u = (row.imageUrl || '').trim();
  if (looksLikeHttpUrl(u)) return u;
  if (row.data && row.mime) {
    return `/api/customer/settings/${proxyPath}?v=${row.updatedAt || 0}`;
  }
  return '';
}

const CustomerDAO = require("../models/CustomerDAO");

function genOtp6() {
  // 6 digits, leading zeros allowed
  const n = Math.floor(Math.random() * 1000000);
  return String(n).padStart(6, '0');
}

function otpHash(otp, salt) {
  // minimal hashing (md5) consistent with existing CryptoUtil usage
  return CryptoUtil.md5(`${String(otp || '')}:${String(salt || '')}`);
}

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
  let keyword = req.params.keyword;
  try {
    keyword = decodeURIComponent(keyword);
  } catch {
    // giữ nguyên nếu chuỗi không phải %encoding
  }
  const products = await ProductDAO.selectByKeyword(keyword);
  res.json(products);
});
router.get("/products/:idOrSlug", async function (req, res) {
  const param = req.params.idOrSlug;
  let product = null;
  if (isLikelyMongoObjectId(param)) {
    product = await ProductDAO.selectByID(param);
  }
  if (!product) {
    const slug = decodeURIComponent(String(param || ''));
    product = await ProductDAO.selectBySlug(slug);
  }
  if (product) {
    const g = product.gallery;
    let list = [];
    if (Array.isArray(g)) {
      list = g.map((x) => (x != null ? String(x).trim() : '')).filter(Boolean);
    } else if (g != null && String(g).trim()) {
      try {
        const p = JSON.parse(String(g));
        if (Array.isArray(p)) {
          list = p.map((x) => String(x || '').trim()).filter(Boolean);
        }
      } catch {
        const one = String(g).trim();
        if (one) list = [one];
      }
    }
    product = { ...product, gallery: list };
  }
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
      const otp = genOtp6();
      const expiresMs = now + 10 * 60 * 1000; // 10 minutes
      const h = otpHash(otp, result._id);
      await CustomerDAO.setOtpForInactiveCustomer(result._id, h, expiresMs, now);

      try {
        await EmailUtil.sendOtp(email, otp, name);
        res.json({
          success: true,
          requiresOtp: true,
          customerId: String(result._id),
          otpExpiresAt: expiresMs,
          message: 'Vui lòng kiểm tra email để lấy mã OTP kích hoạt.',
        });
      } catch (e) {
        res.json({
          success: true,
          requiresOtp: true,
          customerId: String(result._id),
          otpExpiresAt: expiresMs,
          message:
            'Tạo tài khoản thành công nhưng chưa gửi được OTP qua email. Vui lòng bấm “Gửi lại mã” sau ít phút hoặc liên hệ admin.',
        });
      }
    } else {
      res.json({ success: false, message: 'Insert failure' });
    }
  }
});

router.post('/verify-otp', async function (req, res) {
  const id = (req.body.id || '').trim();
  const otp = (req.body.otp || '').trim();
  if (!id || !otp) {
    return res.status(400).json({ success: false, message: 'Thiếu id hoặc otp.' });
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'OTP phải gồm 6 chữ số.' });
  }
  const now = Date.now();
  const h = otpHash(otp, id);
  const row = await CustomerDAO.verifyOtpAndActivate(id, h, now);
  if (row) {
    return res.json({ success: true, message: 'Kích hoạt tài khoản thành công.' });
  }
  return res
    .status(400)
    .json({ success: false, message: 'OTP không đúng hoặc đã hết hạn.' });
});

router.post('/resend-otp', async function (req, res) {
  const id = (req.body.id || '').trim();
  const email = (req.body.email || '').trim();
  if (!id && !email) {
    return res.status(400).json({ success: false, message: 'Thiếu id hoặc email.' });
  }
  const row = await CustomerDAO.selectInactiveByIdOrEmail(id || null, email || null);
  if (!row) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản chưa kích hoạt.' });
  }
  const now = Date.now();
  const cooldownMs = 30 * 1000;
  const c = await CustomerDAO.canResendOtp(row._id, cooldownMs, now);
  if (!c.ok) {
    return res.status(429).json({
      success: false,
      message: 'Vui lòng chờ trước khi gửi lại OTP.',
      waitMs: c.waitMs,
    });
  }
  const otp = genOtp6();
  const expiresMs = now + 10 * 60 * 1000;
  const h = otpHash(otp, row._id);
  await CustomerDAO.setOtpForInactiveCustomer(row._id, h, expiresMs, now);
  try {
    await EmailUtil.sendOtp(row.email, otp, row.name);
    return res.json({ success: true, message: 'Đã gửi lại mã OTP.', otpExpiresAt: expiresMs });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Không gửi được OTP. Vui lòng thử lại sau.',
    });
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
  const items = req.body.items;
  const customer = req.body.customer;
  const promoCodeRaw = req.body.promoCode;
  const shippingAddress = (req.body.shippingAddress || '').trim();
  const paymentMethodRaw = (req.body.paymentMethod || '').trim();
  const paymentMethod = String(paymentMethodRaw || 'COD').toUpperCase();
  const paymentNote = (req.body.paymentNote || '').trim();

  if (!shippingAddress) {
    return res
      .status(400)
      .json({ success: false, message: 'Vui lòng nhập địa chỉ giao hàng.' });
  }
  if (paymentMethod !== 'COD' && paymentMethod !== 'BANK') {
    return res
      .status(400)
      .json({ success: false, message: 'Phương thức thanh toán không hợp lệ.' });
  }

  // compute subtotal from items (trust server-side, not client-provided total)
  let subtotal = 0;
  if (Array.isArray(items)) {
    for (const line of items) {
      const p = line && line.product ? line.product : null;
      const price = p && p.price != null ? Number(p.price) : 0;
      const qty = line && line.quantity != null ? Number(line.quantity) : 0;
      if (Number.isFinite(price) && Number.isFinite(qty) && qty > 0) {
        subtotal += price * qty;
      }
    }
  }
  subtotal = Math.max(0, Math.round(subtotal));

  let promo = null;
  let discount = 0;
  const promoCode = PromoDAO.normalizeCode(promoCodeRaw);
  if (promoCode) {
    promo = await PromoDAO.selectByCode(promoCode);
    const calc = PromoDAO.computeDiscount(promo, subtotal);
    discount = calc.discount || 0;
  }
  const total = Math.max(0, subtotal - discount);

  const order = {
    cdate: now,
    subtotal,
    discount,
    total: total,
    promoCode: promoCode || '',
    promoSnapshot: promo
      ? {
          code: promo.code,
          type: promo.type,
          value: promo.value,
          minSubtotal: promo.minSubtotal || 0,
          maxDiscount: promo.maxDiscount || null,
        }
      : null,
    shippingAddress,
    paymentMethod,
    paymentNote,
    status: 'PENDING',
    customer: customer,
    items: items
  };

  const result = await OrderDAO.insert(order);
  let emailSent = false;
  try {
    const custEmail = customer && customer.email ? String(customer.email).trim() : '';
    if (custEmail) {
      const lines = Array.isArray(items)
        ? items.map((l) => {
            const p = l && l.product ? l.product : {};
            const qty = l && l.quantity != null ? Number(l.quantity) : 0;
            const price = p && p.price != null ? Number(p.price) : 0;
            return {
              name: p && p.name ? String(p.name) : 'Sản phẩm',
              quantity: qty,
              lineTotal:
                Number.isFinite(qty) && Number.isFinite(price) ? qty * price : null,
            };
          })
        : [];
      await EmailUtil.sendOrderPlaced(custEmail, {
        orderId: result && result._id ? String(result._id) : '',
        name: customer && customer.name ? String(customer.name) : '',
        phone: customer && customer.phone ? String(customer.phone) : '',
        shippingAddress,
        paymentMethod,
        promoCode: promoCode || '',
        subtotal,
        discount,
        total,
        items: lines,
      });
      emailSent = true;
    }
  } catch (e) {
    emailSent = false;
  }

  res.json({ success: true, order: result, emailSent });
});

router.post('/promos/applicable', async function (req, res) {
  const subtotal = req.body && req.body.subtotal != null ? Number(req.body.subtotal) : 0;
  const rows = await PromoDAO.selectApplicable(subtotal, 6);
  res.json(rows);
});

router.post('/promos/validate', async function (req, res) {
  const subtotal = req.body && req.body.subtotal != null ? Number(req.body.subtotal) : 0;
  const code = req.body && req.body.code != null ? String(req.body.code) : '';
  const promoCode = PromoDAO.normalizeCode(code);
  if (!promoCode) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mã khuyến mãi.' });
  }
  const promo = await PromoDAO.selectByCode(promoCode);
  const { discount, reason } = PromoDAO.computeDiscount(promo, subtotal);
  if (!promo || reason !== 'OK' || !discount) {
    return res.status(400).json({
      success: false,
      message: 'Mã không hợp lệ hoặc không áp dụng cho đơn hàng này.',
    });
  }
  return res.json({
    success: true,
    code: promoCode,
    discount,
    total: Math.max(0, Math.round(Number(subtotal) || 0) - discount),
    promo: {
      code: promo.code,
      name: promo.name || '',
      type: promo.type,
      value: promo.value,
      minSubtotal: promo.minSubtotal || 0,
      maxDiscount: promo.maxDiscount || null,
    },
  });
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});

// Public UI settings — chỉ trả URL (Firebase / proxy legacy), không trả base64 trong JSON.
router.get('/settings/auth-hero-bg', async function (req, res) {
  const row = await SettingDAO.getByKey('authHeroBg');
  res.json({
    imageUrl: publicSettingImageUrl(row, 'auth-hero-bg-image'),
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.get('/settings/site-logo', async function (req, res) {
  const row = await SettingDAO.getByKey('siteLogo');
  res.json({
    imageUrl: publicSettingImageUrl(row, 'site-logo-image'),
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.get('/settings/site-favicon', async function (req, res) {
  const row = await SettingDAO.getByKey('siteFavicon');
  res.json({
    imageUrl: publicSettingImageUrl(row, 'site-favicon-image'),
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.get('/settings/site-title', async function (req, res) {
  const row = await SettingDAO.getByKey('siteTitle');
  res.json({
    title: (row && row.data) || '',
    updatedAt: (row && row.updatedAt) || 0,
  });
});

router.get('/settings/auth-hero-bg-image', async function (req, res) {
  const row = await SettingDAO.getByKey('authHeroBg');
  if (!row || !row.data || !row.mime) return res.status(404).end();
  const mime = row.mime;
  try {
    const buf = Buffer.from(String(row.data), 'base64');
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    if (row.updatedAt) res.setHeader('ETag', String(row.updatedAt));
    res.end(buf);
  } catch {
    res.status(500).end();
  }
});

router.get('/settings/site-logo-image', async function (req, res) {
  const row = await SettingDAO.getByKey('siteLogo');
  if (!row || !row.mime || !row.data) return res.status(404).end();
  try {
    const buf = Buffer.from(String(row.data), 'base64');
    res.setHeader('Content-Type', row.mime);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    if (row.updatedAt) res.setHeader('ETag', String(row.updatedAt));
    res.end(buf);
  } catch {
    res.status(500).end();
  }
});

router.get('/settings/site-favicon-image', async function (req, res) {
  const row = await SettingDAO.getByKey('siteFavicon');
  if (!row || !row.mime || !row.data) return res.status(404).end();
  try {
    const buf = Buffer.from(String(row.data), 'base64');
    res.setHeader('Content-Type', row.mime);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    if (row.updatedAt) res.setHeader('ETag', String(row.updatedAt));
    res.end(buf);
  } catch {
    res.status(500).end();
  }
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
