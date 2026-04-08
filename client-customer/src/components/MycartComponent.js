import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import { formatVnd } from '../utils/formatVnd';
import { productPath } from '../utils/productPath';
import { productImageSrc } from '../utils/productImageSrc';
import axios from 'axios';
import withRouter from '../utils/withRouter';
import { notifyError, notifySuccess, notifyWarning } from '../utils/notify';
import '../styles/mycart.css';

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      showCheckoutConfirm: false,
      promoInput: '',
      promoApplied: null, // { code, discount, total, promo }
      promoError: '',
      promoLoading: false,
      promoApplicable: [],

      shippingAddress: '',
      paymentMethod: 'COD',
      paymentNote: '',
    };
  }

  cartItemCount(lines) {
    return lines.reduce((n, line) => n + line.quantity, 0);
  }

  lnkRemoveClick(id) {
    const next = this.context.mycart.filter((x) => x.product._id !== id);
    this.context.setMycart(next);
  }

  changeQty(id, delta) {
    const mycart = this.context.mycart;
    const idx = mycart.findIndex((x) => x.product._id === id);
    if (idx === -1) return;

    const line = mycart[idx];
    const nextQty = line.quantity + delta;
    if (nextQty < 1) {
      this.lnkRemoveClick(id);
      return;
    }

    const next = mycart.map((row, i) =>
      i === idx ? { ...row, quantity: nextQty } : row
    );
    this.context.setMycart(next);
  }

  lnkCheckoutClick() {
    if (this.context.mycart.length === 0) {
      notifyWarning('Giỏ hàng của bạn đang trống.');
      return;
    }
    if (!this.context.customer) {
      this.props.navigate('/login');
      return;
    }
    this.setState(
      { showCheckoutConfirm: true, promoError: '', promoApplied: null },
      () => this.loadApplicablePromos()
    );
  }

  loadApplicablePromos() {
    const subtotal = CartUtil.getTotal(this.context.mycart);
    this.setState({ promoLoading: true });
    axios
      .post('/api/customer/promos/applicable', { subtotal })
      .then((res) => {
        this.setState({ promoApplicable: res.data || [] });
      })
      .catch(() => {
        this.setState({ promoApplicable: [] });
      })
      .finally(() => this.setState({ promoLoading: false }));
  }

  applyPromo(code) {
    const subtotal = CartUtil.getTotal(this.context.mycart);
    const c = String(code || '').trim();
    if (!c) {
      this.setState({ promoError: 'Vui lòng nhập mã khuyến mãi.' });
      return;
    }
    this.setState({ promoError: '', promoLoading: true });
    axios
      .post('/api/customer/promos/validate', { subtotal, code: c })
      .then((res) => {
        const r = res.data || {};
        if (r.success) {
          this.setState({ promoApplied: r, promoInput: r.code || c });
          notifySuccess('Đã áp dụng mã ' + (r.code || c));
        } else {
          this.setState({ promoApplied: null, promoError: r.message || 'Không áp dụng được mã.' });
        }
      })
      .catch((err) => {
        const msg =
          (err && err.response && err.response.data && err.response.data.message) ||
          'Không áp dụng được mã khuyến mãi.';
        this.setState({ promoApplied: null, promoError: msg });
      })
      .finally(() => this.setState({ promoLoading: false }));
  }

  confirmCheckout() {
    this.setState({ showCheckoutConfirm: false });
    const total = CartUtil.getTotal(this.context.mycart);
    const items = this.context.mycart;
    const customer = this.context.customer;
    const promoCode =
      (this.state.promoApplied && this.state.promoApplied.code) ||
      (this.state.promoInput || '').trim();
    const shippingAddress = (this.state.shippingAddress || '').trim();
    const paymentMethod = this.state.paymentMethod || 'COD';
    const paymentNote = (this.state.paymentNote || '').trim();

    if (!shippingAddress) {
      notifyWarning('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    this.apiCheckout(total, items, customer, promoCode, shippingAddress, paymentMethod, paymentNote);
  }

  apiCheckout(total, items, customer, promoCode, shippingAddress, paymentMethod, paymentNote) {
    const body = {
      total: total,
      items: items,
      customer: customer,
      promoCode,
      shippingAddress,
      paymentMethod,
      paymentNote,
    };
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .post('/api/customer/checkout', body, config)
      .then((res) => {
        const result = res.data;
        if (result && result.success) {
          const emailSent = result.emailSent === true;
          notifySuccess(
            emailSent
              ? 'Đặt hàng thành công! Email xác nhận đã được gửi.'
              : 'Đặt hàng thành công!'
          );
          this.context.setMycart([]);
          this.props.navigate('/home');
        } else {
          notifyError(
            (result && result.message) || 'Thanh toán thất bại. Vui lòng thử lại.'
          );
        }
      })
      .catch((err) => {
        const msg =
          (err && err.response && err.response.data && err.response.data.message) ||
          'Không thể kết nối máy chủ. Vui lòng thử lại.';
        notifyError(msg);
      });
  }

  render() {
    const lines = this.context.mycart;
    const total = CartUtil.getTotal(lines);
    const itemCount = this.cartItemCount(lines);
    const applied = this.state.promoApplied;
    const discount = applied && applied.discount ? Number(applied.discount) : 0;
    const finalTotal =
      applied && applied.total != null ? Number(applied.total) : total;

    return (
      <>
        <div className="cc-cart-page align-center cc-home__section">
          <div className="cc-section-shell cc-cart__shell">
            <header className="cc-cart__head">
              <div className="cc-cart__head-text">
                <h1 className="cc-cart__title">Giỏ hàng</h1>
                <p className="cc-cart__subtitle">
                  {lines.length === 0
                    ? 'Chưa có sản phẩm nào trong giỏ'
                    : `${itemCount} sản phẩm · ${lines.length} mặt hàng`}
                </p>
              </div>
              <Link to="/home" className="cc-cart__continue">
                ← Tiếp tục mua sắm
              </Link>
            </header>

            {lines.length === 0 ? (
              <div className="cc-cart__empty">
                <div className="cc-cart__empty-icon" aria-hidden="true" />
                <h2 className="cc-cart__empty-title">Giỏ hàng đang trống</h2>
                <p className="cc-cart__empty-text">
                  Thêm laptop hoặc phụ kiện yêu thích vào giỏ để tiện theo dõi
                  và thanh toán khi bạn sẵn sàng.
                </p>
                <Link to="/home" className="cc-cart__empty-btn">
                  Khám phá sản phẩm
                </Link>
              </div>
            ) : (
              <div className="cc-cart__layout">
                <div className="cc-cart__list" role="list">
                  {lines.map((item) => {
                    const p = item.product;
                    const catName =
                      p.category && p.category.name ? p.category.name : '';
                    const lineTotal = p.price * item.quantity;
                    return (
                      <article
                        key={p._id}
                        className="cc-cart__line"
                        role="listitem"
                      >
                        <Link
                          to={productPath(p)}
                          className="cc-cart__line-img-wrap"
                        >
                          <img
                            className="cc-cart__line-img"
                            src={productImageSrc(p.image)}
                            alt={p.name}
                          />
                        </Link>
                        <div className="cc-cart__line-body">
                          <div className="cc-cart__line-main">
                            <Link
                              to={productPath(p)}
                              className="cc-cart__line-name"
                            >
                              {p.name}
                            </Link>
                            {catName ? (
                              <span className="cc-cart__line-cat">{catName}</span>
                            ) : null}
                          </div>
                          <div className="cc-cart__line-price">
                            <span className="cc-cart__line-price-label">
                              Đơn giá
                            </span>
                            <span className="cc-cart__line-price-value">
                              {formatVnd(p.price)}
                            </span>
                          </div>
                          <div
                            className="cc-cart__line-qty"
                            role="group"
                            aria-label={'Số lượng ' + p.name}
                          >
                            <button
                              type="button"
                              className="cc-cart__qty-btn"
                              onClick={() => this.changeQty(p._id, -1)}
                              aria-label="Giảm số lượng"
                            >
                              −
                            </button>
                            <span className="cc-cart__qty-val">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="cc-cart__qty-btn"
                              onClick={() => this.changeQty(p._id, 1)}
                              aria-label="Tăng số lượng"
                            >
                              +
                            </button>
                          </div>
                          <div className="cc-cart__line-subtotal">
                            <span className="cc-cart__line-subtotal-label">
                              Thành tiền
                            </span>
                            {formatVnd(lineTotal)}
                          </div>
                          <button
                            type="button"
                            className="cc-cart__line-remove"
                            onClick={() => this.lnkRemoveClick(p._id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <aside className="cc-cart__summary" aria-labelledby="cart-summary-title">
                  <h2 id="cart-summary-title" className="cc-cart__summary-title">
                    Tóm tắt đơn hàng
                  </h2>
                  <div className="cc-cart__summary-row">
                    <span className="cc-cart__summary-label">Tạm tính</span>
                    <span className="cc-cart__summary-value">
                      {formatVnd(total)}
                    </span>
                  </div>
                  <div className="cc-cart__summary-row">
                    <span className="cc-cart__summary-label">Số lượng</span>
                    <span className="cc-cart__summary-value">
                      {itemCount} sản phẩm
                    </span>
                  </div>
                  <div className="cc-cart__summary-row cc-cart__summary-row--total">
                    <span className="cc-cart__summary-label">Tổng cộng</span>
                    <span className="cc-cart__summary-total">
                      {formatVnd(total)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cc-cart__checkout"
                    onClick={() => this.lnkCheckoutClick()}
                  >
                    Thanh toán
                  </button>
                  <p className="cc-cart__summary-note">
                    Giá đã bao gồm VAT (nếu có). Phí vận chuyển sẽ được xác
                    nhận khi xử lý đơn.
                  </p>
                </aside>
              </div>
            )}
          </div>
        </div>

        {this.state.showCheckoutConfirm && (
          <div
            className="cc-checkout-backdrop"
            role="presentation"
            onClick={() => this.setState({ showCheckoutConfirm: false })}
          >
            <div
              className="cc-checkout-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cc-checkout-title"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="cc-checkout__head">
                <div className="cc-checkout__head-text">
                  <h3 id="cc-checkout-title" className="cc-checkout__title">
                    Thanh toán
                  </h3>
                  <p className="cc-checkout__text">
                    Xác nhận thông tin giao hàng, chọn phương thức thanh toán và
                    áp dụng mã khuyến mãi (nếu có).
                  </p>
                </div>
                <button
                  type="button"
                  className="cc-checkout__close"
                  onClick={() => this.setState({ showCheckoutConfirm: false })}
                  aria-label="Đóng"
                >
                  ×
                </button>
              </header>

              <div className="cc-checkout__content">
                <section className="cc-checkout__section">
                  <div className="cc-checkout__section-title">Tóm tắt thanh toán</div>
                  <div className="cc-checkout__total">
                    <div className="cc-checkout__total-grid">
                      <div className="cc-checkout__row">
                        <span>Tạm tính</span>
                        <b>{formatVnd(total)}</b>
                      </div>
                      {discount > 0 ? (
                        <div className="cc-checkout__row cc-checkout__row--discount">
                          <span>Giảm giá</span>
                          <b>−{formatVnd(discount)}</b>
                        </div>
                      ) : null}
                      <div className="cc-checkout__row cc-checkout__row--grand">
                        <span>Tổng thanh toán</span>
                        <b>{formatVnd(finalTotal)}</b>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="cc-checkout__section">
                  <div className="cc-checkout__section-title">Mã khuyến mãi</div>
                  <div className="cc-checkout__promo-row">
                    <input
                      type="text"
                      value={this.state.promoInput}
                      onChange={(e) =>
                        this.setState({ promoInput: e.target.value, promoError: '' })
                      }
                      placeholder="Nhập mã (VD: SALE10)"
                      className="cc-checkout__promo-input"
                    />
                    <button
                      type="button"
                      className="cc-checkout__btn cc-checkout__btn--primary"
                      onClick={() => this.applyPromo(this.state.promoInput)}
                      disabled={this.state.promoLoading}
                    >
                      {this.state.promoLoading ? 'Đang áp dụng…' : 'Áp dụng'}
                    </button>
                  </div>
                  {this.state.promoError ? (
                    <div className="cc-checkout__error">{this.state.promoError}</div>
                  ) : null}

                  {this.state.promoApplicable && this.state.promoApplicable.length > 0 ? (
                    <div className="cc-checkout__subsection">
                      <div className="cc-checkout__subhead">Gợi ý phù hợp</div>
                      <div className="cc-coupon-grid">
                        {this.state.promoApplicable.map((p) => {
                          const title = p.name || p.code;
                          const desc =
                            p.description ||
                            (p.minSubtotal
                              ? `Áp dụng cho đơn từ ${formatVnd(p.minSubtotal)}`
                              : 'Áp dụng cho đơn hàng phù hợp.');
                          const preview =
                            p.discountPreview && Number(p.discountPreview) > 0
                              ? `Giảm ${formatVnd(p.discountPreview)}`
                              : '';
                          return (
                            <button
                              key={p._id}
                              type="button"
                              className="cc-coupon"
                              onClick={() => this.applyPromo(p.code)}
                              disabled={this.state.promoLoading}
                              title={p.code}
                            >
                              <span className="cc-coupon__icon" aria-hidden>
                                <svg viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M21 11.5V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v4.5a2.5 2.5 0 0 1 0 5V21a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4.5a2.5 2.5 0 0 1 0-5Z"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M9 9h6M9 13h6M9 17h4"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </span>
                              <span className="cc-coupon__body">
                                <span className="cc-coupon__top">
                                  <span className="cc-coupon__title">{title}</span>
                                  <span className="cc-coupon__code">{p.code}</span>
                                </span>
                                <span className="cc-coupon__desc">{desc}</span>
                                {preview ? (
                                  <span className="cc-coupon__preview">{preview}</span>
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </section>

                <section className="cc-checkout__section">
                  <div className="cc-checkout__section-title">Giao hàng</div>
                  <textarea
                    value={this.state.shippingAddress}
                    onChange={(e) =>
                      this.setState({ shippingAddress: e.target.value })
                    }
                    placeholder="VD: 69/89 Đặng Thùy Trâm, P. Bình Lợi Trung, TP.HCM"
                    rows={3}
                    className="cc-checkout__textarea"
                  />
                </section>

                <section className="cc-checkout__section">
                  <div className="cc-checkout__section-title">Thanh toán</div>
                  <div className="cc-checkout__pm">
                    <label className="cc-checkout__pm-item">
                      <input
                        type="radio"
                        name="pm"
                        checked={this.state.paymentMethod === 'COD'}
                        onChange={() => this.setState({ paymentMethod: 'COD' })}
                      />
                      <span>
                        <b>Thanh toán khi nhận hàng (COD)</b>
                        <div className="cc-checkout__pm-sub">
                          Trả tiền mặt/QR khi nhận hàng.
                        </div>
                      </span>
                    </label>
                    <label className="cc-checkout__pm-item">
                      <input
                        type="radio"
                        name="pm"
                        checked={this.state.paymentMethod === 'BANK'}
                        onChange={() => this.setState({ paymentMethod: 'BANK' })}
                      />
                      <span>
                        <b>Chuyển khoản</b>
                        <div className="cc-checkout__pm-sub">
                          Chuyển khoản trước, admin xác nhận sau.
                        </div>
                      </span>
                    </label>
                  </div>

                  {this.state.paymentMethod === 'BANK' ? (
                    <div className="cc-checkout__bank">
                      <div className="cc-checkout__bank-title">
                        Thông tin chuyển khoản
                      </div>
                      <div className="cc-checkout__bank-body">
                        <div>
                          Ngân hàng: <b>Vietcombank</b>
                        </div>
                        <div>
                          Số TK: <b>0123 456 789</b>
                        </div>
                        <div>
                          Chủ TK: <b>VLU Laptop Shop</b>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          Nội dung: <b>SĐT + Mã đơn</b> (sau khi đặt hàng)
                        </div>
                      </div>
                      <input
                        type="text"
                        value={this.state.paymentNote}
                        onChange={(e) =>
                          this.setState({ paymentNote: e.target.value })
                        }
                        placeholder="Ghi chú / Mã giao dịch (tuỳ chọn)"
                        className="cc-checkout__input"
                      />
                    </div>
                  ) : null}
                </section>
              </div>

              <footer className="cc-checkout__footer">
                <div className="cc-checkout__footer-total">
                  <span>Tổng</span>
                  <b>{formatVnd(finalTotal)}</b>
                </div>
                <button
                  type="button"
                  className="cc-checkout__btn cc-checkout__btn--ghost"
                  onClick={() => this.setState({ showCheckoutConfirm: false })}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="cc-checkout__btn cc-checkout__btn--primary"
                  onClick={() => this.confirmCheckout()}
                >
                  Đặt hàng
                </button>
              </footer>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default withRouter(Mycart);
