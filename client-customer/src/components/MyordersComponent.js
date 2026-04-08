import axios from 'axios';
import { productImageSrc } from '../utils/productImageSrc';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import { formatVnd } from '../utils/formatVnd';

class Myorders extends Component {

  static contextType = MyContext; // using this.context to access global state

  constructor(props) {
    super(props);

    this.state = {
      orders: [],
      order: null,
      expandedId: '',
    };
  }

  statusMeta(status) {
    const s = String(status || '').toUpperCase();
    if (s === 'APPROVED') return { label: 'Đã duyệt', tone: 'ok' };
    if (s === 'PENDING') return { label: 'Chờ duyệt', tone: 'warn' };
    if (s === 'CANCELLED' || s === 'CANCELED') return { label: 'Đã huỷ', tone: 'bad' };
    if (s === 'SHIPPING') return { label: 'Đang giao', tone: 'info' };
    if (s === 'DONE' || s === 'COMPLETED') return { label: 'Hoàn tất', tone: 'ok' };
    return { label: status || '—', tone: 'neutral' };
  }

  orderSummaryText(order) {
    if (!order) return '';
    const st = this.statusMeta(order.status);
    const when = order.cdate ? new Date(order.cdate).toLocaleString('vi-VN') : '—';
    return `${when} · ${st.label} · Tổng ${formatVnd(order.total)}`;
  }

  render() {

    if (this.context.token === '')
      return (<Navigate replace to='/login' />);

    return (
      <div className="cc-orders align-center cc-home__section">
        <div className="cc-section-shell cc-orders__shell">
          <header className="cc-orders__head">
            <div>
              <h1 className="cc-orders__title">Đơn hàng</h1>
              <p className="cc-orders__subtitle">
                Chọn một đơn để xem chi tiết sản phẩm.
              </p>
            </div>
          </header>

          <section>
            <h2 className="cc-orders__card-title">Danh sách đơn</h2>
            {this.state.orders && this.state.orders.length > 0 ? (
              <div className="cc-orders__list" role="list">
                {this.state.orders.map((o) => {
                  const st = this.statusMeta(o.status);
                  const when = o.cdate ? new Date(o.cdate).toLocaleString('vi-VN') : '—';
                  const isOpen = String(this.state.expandedId) === String(o._id);
                  return (
                    <div key={o._id} className="cc-orders__group" role="listitem">
                      <button
                        type="button"
                        className={'cc-orders__row' + (isOpen ? ' cc-orders__row--open' : '')}
                        onClick={() => this.toggleOrder(o)}
                        aria-expanded={isOpen ? 'true' : 'false'}
                      >
                        <div className="cc-orders__row-top">
                          <div className="cc-orders__id" title={o._id}>
                            #{String(o._id).slice(-8)}
                          </div>
                          <span className={'cc-orders__badge cc-orders__badge--' + st.tone}>
                            {st.label}
                          </span>
                        </div>
                        <div className="cc-orders__row-mid">
                          <div className="cc-orders__meta">
                            <span className="cc-orders__meta-label">Thời gian</span>
                            <span className="cc-orders__meta-value">{when}</span>
                          </div>
                          <div className="cc-orders__meta">
                            <span className="cc-orders__meta-label">Tổng</span>
                            <span className="cc-orders__meta-value cc-orders__total">
                              {formatVnd(o.total)}
                            </span>
                          </div>
                        </div>
                        <div className="cc-orders__row-bot">
                          <div className="cc-orders__sub">
                            {o.customer && o.customer.name ? o.customer.name : '—'}
                            {o.customer && o.customer.phone ? ` · ${o.customer.phone}` : ''}
                          </div>
                          <div className="cc-orders__hint">
                            {isOpen ? 'Thu gọn' : 'Xem chi tiết'}
                            <span className="cc-orders__chev" aria-hidden="true">
                              {isOpen ? '▴' : '▾'}
                            </span>
                          </div>
                        </div>
                      </button>

                      {isOpen ? (
                        <div className="cc-orders__expand" role="region" aria-label="Chi tiết đơn">
                          <div className="cc-orders__summary">
                            <div className="cc-orders__summary-row">
                              <span>Mã đơn</span>
                              <b>{o._id}</b>
                            </div>
                            <div className="cc-orders__summary-row">
                              <span>Trạng thái</span>
                              <span className={'cc-orders__badge cc-orders__badge--' + st.tone}>
                                {st.label}
                              </span>
                            </div>
                            <div className="cc-orders__summary-row">
                              <span>Tổng tiền</span>
                              <b className="cc-orders__total">{formatVnd(o.total)}</b>
                            </div>
                          </div>

                          <div className="cc-orders__items">
                            {(o.items || []).map((it) => (
                              <div className="cc-orders__item" key={it.product._id}>
                                <img
                                  className="cc-orders__thumb"
                                  src={productImageSrc(it.product.image)}
                                  alt={it.product.name}
                                  loading="lazy"
                                />
                                <div className="cc-orders__item-main">
                                  <div className="cc-orders__item-name">{it.product.name}</div>
                                  <div className="cc-orders__item-sub">
                                    {formatVnd(it.product.price)} · SL {it.quantity}
                                  </div>
                                </div>
                                <div className="cc-orders__item-right">
                                  <div className="cc-orders__item-total">
                                    {formatVnd(it.product.price * it.quantity)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="cc-orders__empty">Bạn chưa có đơn hàng nào.</div>
            )}
          </section>
        </div>
      </div>
    );
  }

  componentDidMount() {

    if (this.context.customer) {

      const cid = this.context.customer._id;

      this.apiGetOrdersByCustID(cid);

    }

  }

  toggleOrder(item) {
    const id = item && item._id ? String(item._id) : '';
    this.setState((s) => ({
      order: item,
      expandedId: s.expandedId === id ? '' : id,
    }));
  }

  apiGetOrdersByCustID(cid) {

    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.get('/api/customer/orders/customer/' + cid, config).then((res) => {

      const result = res.data;

      this.setState({ orders: result });

    });
  }

}

export default Myorders;