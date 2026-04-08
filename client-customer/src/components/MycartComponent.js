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
    this.state = { showCheckoutConfirm: false };
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
    this.setState({ showCheckoutConfirm: true });
  }

  confirmCheckout() {
    this.setState({ showCheckoutConfirm: false });
    const total = CartUtil.getTotal(this.context.mycart);
    const items = this.context.mycart;
    const customer = this.context.customer;
    this.apiCheckout(total, items, customer);
  }

  apiCheckout(total, items, customer) {
    const body = { total: total, items: items, customer: customer };
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios
      .post('/api/customer/checkout', body, config)
      .then((res) => {
        const result = res.data;
        if (result) {
          notifySuccess('Đặt hàng thành công!');
          this.context.setMycart([]);
          this.props.navigate('/home');
        } else {
          notifyError('Thanh toán thất bại. Vui lòng thử lại.');
        }
      })
      .catch(() => {
        notifyError('Không thể kết nối máy chủ. Vui lòng thử lại.');
      });
  }

  render() {
    const lines = this.context.mycart;
    const total = CartUtil.getTotal(lines);
    const itemCount = this.cartItemCount(lines);

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
              <h3 id="cc-checkout-title" className="cc-checkout__title">
                Xác nhận đặt hàng?
              </h3>
              <p className="cc-checkout__text">
                Bạn sắp hoàn tất đơn với số tiền dưới đây. Vui lòng kiểm tra lại
                sản phẩm và số lượng trước khi xác nhận.
              </p>
              <div className="cc-checkout__total">
                Tổng thanh toán: {formatVnd(CartUtil.getTotal(lines))}
              </div>
              <div className="cc-checkout__actions">
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
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default withRouter(Mycart);
