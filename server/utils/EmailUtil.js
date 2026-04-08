const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS,
  },
});

function normalizeBaseUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  return s.replace(/\/+$/, '');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatVnd(n) {
  const x = Number(n) || 0;
  try {
    return x.toLocaleString('vi-VN') + '₫';
  } catch {
    return String(x) + '₫';
  }
}

const EmailUtil = {
  sendOrderPlaced(email, payload) {
    const to = String(email || '').trim();
    if (!to) {
      return Promise.reject(new Error('Missing customer email.'));
    }

    const orderId = payload && payload.orderId ? String(payload.orderId) : '';
    const name = payload && payload.name ? String(payload.name) : '';
    const phone = payload && payload.phone ? String(payload.phone) : '';
    const shippingAddress =
      payload && payload.shippingAddress ? String(payload.shippingAddress) : '';
    const paymentMethod =
      payload && payload.paymentMethod ? String(payload.paymentMethod) : 'COD';
    const subtotal = payload && payload.subtotal != null ? Number(payload.subtotal) : 0;
    const discount = payload && payload.discount != null ? Number(payload.discount) : 0;
    const total = payload && payload.total != null ? Number(payload.total) : 0;
    const promoCode = payload && payload.promoCode ? String(payload.promoCode) : '';
    const items = Array.isArray(payload && payload.items) ? payload.items : [];

    const pmLabel =
      String(paymentMethod).toUpperCase() === 'BANK'
        ? 'Chuyển khoản'
        : 'Thanh toán khi nhận hàng (COD)';

    const textLines = [
      'Xác nhận đặt hàng | VLU Laptop Shop',
      '',
      name ? `Khách hàng: ${name}` : null,
      phone ? `SĐT: ${phone}` : null,
      orderId ? `Mã đơn: ${orderId}` : null,
      '',
      'Giao hàng:',
      shippingAddress ? shippingAddress : '—',
      '',
      `Thanh toán: ${pmLabel}`,
      promoCode ? `Mã khuyến mãi: ${promoCode}` : null,
      `Tạm tính: ${formatVnd(subtotal)}`,
      discount > 0 ? `Giảm giá: -${formatVnd(discount)}` : null,
      `Tổng thanh toán: ${formatVnd(total)}`,
      '',
      'Sản phẩm:',
      ...items.map((it) => {
        const pname = it && it.name ? it.name : 'Sản phẩm';
        const qty = it && it.quantity != null ? Number(it.quantity) : 0;
        const lineTotal = it && it.lineTotal != null ? Number(it.lineTotal) : null;
        const suffix = lineTotal != null ? ` (${formatVnd(lineTotal)})` : '';
        return `- ${pname} × ${qty}${suffix}`;
      }),
      '',
      'Cảm ơn bạn đã mua hàng!',
    ].filter(Boolean);

    const text = textLines.join('\n');

    const htmlItems = items
      .map((it) => {
        const pname = escapeHtml(it && it.name ? it.name : 'Sản phẩm');
        const qty = it && it.quantity != null ? Number(it.quantity) : 0;
        const lineTotal = it && it.lineTotal != null ? Number(it.lineTotal) : null;
        return `<tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0;">${pname}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right;">${qty}</td>
          <td style="padding:10px 12px; border-bottom:1px solid #e2e8f0; text-align:right;">${
            lineTotal != null ? escapeHtml(formatVnd(lineTotal)) : '—'
          }</td>
        </tr>`;
      })
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
        <h2 style="margin:0 0 8px;">Xác nhận đặt hàng</h2>
        <p style="margin:0 0 16px; color:#475569;">
          ${name ? `Xin chào <b>${escapeHtml(name)}</b>, ` : ''}đơn hàng của bạn đã được ghi nhận thành công.
        </p>

        <div style="border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; margin-bottom:16px;">
          <div style="padding:12px 14px; background:#f8fafc; border-bottom:1px solid #e2e8f0;">
            <b>Mã đơn:</b> ${escapeHtml(orderId || '—')}
          </div>
          <div style="padding:12px 14px;">
            <div><b>Thanh toán:</b> ${escapeHtml(pmLabel)}</div>
            ${promoCode ? `<div><b>Coupon:</b> ${escapeHtml(promoCode)}</div>` : ''}
            <div style="margin-top:10px; color:#475569;"><b>Địa chỉ giao hàng:</b><br/>${escapeHtml(
              shippingAddress || '—'
            )}</div>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="text-align:left; padding:10px 12px; border-bottom:1px solid #e2e8f0;">Sản phẩm</th>
              <th style="text-align:right; padding:10px 12px; border-bottom:1px solid #e2e8f0;">SL</th>
              <th style="text-align:right; padding:10px 12px; border-bottom:1px solid #e2e8f0;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${htmlItems || `<tr><td colspan="3" style="padding:12px;">—</td></tr>`}
          </tbody>
        </table>

        <div style="margin-top:14px; padding:12px 14px; background:#0f172a; color:#fff; border-radius:14px;">
          <div style="display:flex; justify-content:space-between; gap:12px;">
            <span style="opacity:0.85;">Tạm tính</span>
            <b>${escapeHtml(formatVnd(subtotal))}</b>
          </div>
          ${
            discount > 0
              ? `<div style="display:flex; justify-content:space-between; gap:12px; margin-top:6px;">
                   <span style="opacity:0.85;">Giảm giá</span>
                   <b style="color:#fbbf24;">-${escapeHtml(formatVnd(discount))}</b>
                 </div>`
              : ''
          }
          <div style="display:flex; justify-content:space-between; gap:12px; margin-top:10px; font-size:1.05rem;">
            <span style="opacity:0.9;">Tổng thanh toán</span>
            <b>${escapeHtml(formatVnd(total))}</b>
          </div>
        </div>

        <p style="margin:14px 0 0; color:#475569; font-size:13px;">
          Cảm ơn bạn đã mua hàng tại VLU Laptop Shop.
        </p>
      </div>
    `.trim();

    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to,
        subject: `Xác nhận đơn hàng ${orderId ? '#' + orderId : ''} | VLU Laptop Shop`,
        text,
        html,
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  sendOtp(email, otp, name) {
    const safeName = String(name || '').trim();
    const otpStr = String(otp || '').trim();

    const text =
      'Mã OTP kích hoạt tài khoản\n\n' +
      (safeName ? `Xin chào ${safeName},\n\n` : '') +
      `Mã OTP của bạn là: ${otpStr}\n` +
      'Mã có hiệu lực trong 10 phút.\n\n' +
      'Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.\n';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
        <h2 style="margin:0 0 8px;">Xác minh email bằng OTP</h2>
        ${
          safeName
            ? `<p style="margin:0 0 12px;">Xin chào <b>${escapeHtml(
                safeName
              )}</b>,</p>`
            : ''
        }
        <p style="margin:0 0 16px;">
          Vui lòng nhập mã OTP bên dưới để kích hoạt tài khoản. Mã có hiệu lực <b>10 phút</b>.
        </p>
        <div style="display:inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size:28px; letter-spacing:0.25em; font-weight:800; background:#f8fafc; border:1px solid #e2e8f0;
          padding:14px 18px; border-radius:14px;">
          ${escapeHtml(otpStr)}
        </div>
        <p style="margin:16px 0 0; font-size:13px; color:#475569;">
          Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.
        </p>
      </div>
    `.trim();

    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Mã OTP kích hoạt | VLU Laptop Shop',
        text,
        html,
      };
      transporter.sendMail(mailOptions, function (err, result) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  send(email, id, token) {
    const baseUrl = normalizeBaseUrl(
      process.env.CUSTOMER_APP_BASE_URL || process.env.APP_BASE_URL
    );
    const activationPath =
      '/active?id=' +
      encodeURIComponent(String(id || '')) +
      '&token=' +
      encodeURIComponent(String(token || ''));
    const activationLink = baseUrl ? `${baseUrl}${activationPath}` : '';

    const text =
      'Kích hoạt tài khoản của bạn\n\n' +
      (activationLink
        ? `Mở link sau để kích hoạt: ${activationLink}\n\n`
        : '') +
      'Nếu không mở được link, bạn có thể nhập thủ công tại trang /active:\n' +
      `- id: ${id}\n` +
      `- token: ${token}\n`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#0f172a;">
        <h2 style="margin:0 0 8px;">Kích hoạt tài khoản</h2>
        <p style="margin:0 0 16px;">Cảm ơn bạn đã đăng ký. Vui lòng bấm nút bên dưới để kích hoạt tài khoản.</p>
        ${
          activationLink
            ? `<p style="margin:0 0 20px;">
                <a href="${escapeHtml(
                  activationLink
                )}" style="display:inline-block; padding:12px 18px; border-radius:999px; background:#2563eb; color:#fff; text-decoration:none; font-weight:700;">
                  Kích hoạt tài khoản
                </a>
              </p>
              <p style="margin:0 0 16px; font-size:13px; color:#475569;">
                Nếu nút không bấm được, copy link này vào trình duyệt:<br/>
                <a href="${escapeHtml(activationLink)}">${escapeHtml(
                activationLink
              )}</a>
              </p>`
            : `<p style="margin:0 0 16px; font-size:13px; color:#b91c1c;">
                (Chưa cấu hình link kích hoạt. Vui lòng cấu hình biến môi trường <b>CUSTOMER_APP_BASE_URL</b>.)
              </p>`
        }
        <hr style="border:none; border-top:1px solid #e2e8f0; margin:20px 0;" />
        <p style="margin:0 0 8px; font-size:13px; color:#475569;">Kích hoạt thủ công (nếu cần):</p>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:13px; background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:12px;">
          <div><b>id</b>: ${escapeHtml(id)}</div>
          <div><b>token</b>: ${escapeHtml(token)}</div>
        </div>
      </div>
    `.trim();

    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Kích hoạt tài khoản | VLU Laptop Shop',
        text,
        html,
      };

      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  },
};

module.exports = EmailUtil;
