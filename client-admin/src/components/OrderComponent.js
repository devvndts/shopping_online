import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { notifyPromise } from '../utils/notify';
import { formatVnd } from '../utils/formatVnd';
import { customerProductPath } from '../utils/customerProductPath';
import { FiBox, FiClock, FiDollarSign } from 'react-icons/fi';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      expandedId: null,
      summary: null,
      summaryLoading: true,
    };
  }

  componentDidMount() {
    this.apiGetOrders();
    this.apiGetSummary();
  }

  apiGetOrders() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/orders', config)
      .then((res) => {
        this.setState({ orders: res.data || [], loading: false });
      })
      .catch(() => {
        this.setState({ orders: [], loading: false });
      });
  }

  apiGetSummary() {
    const config = { headers: { 'x-access-token': this.context.token } };
    this.setState({ summaryLoading: true });
    axios
      .get('/api/admin/orders/summary', config)
      .then((res) => this.setState({ summary: res.data || null, summaryLoading: false }))
      .catch(() => this.setState({ summary: null, summaryLoading: false }));
  }

  setStatus = (id, status) => {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios
      .patch('/api/admin/orders/' + id + '/status', { status }, config)
      .then((res) => {
        if (!(res.data && res.data.success)) {
          throw new Error((res.data && res.data.message) || 'Cập nhật thất bại.');
        }
        this.apiGetOrders();
        this.apiGetSummary();
      });
    notifyPromise(p, {
      pending: 'Đang cập nhật trạng thái đơn…',
      success: 'Đã cập nhật trạng thái đơn.',
      error: 'Cập nhật trạng thái đơn thất bại.',
    });
  };

  toggleExpand = (id) => {
    this.setState((s) => ({
      expandedId: s.expandedId === id ? null : id,
    }));
  };

  formatDate(ts) {
    if (ts == null) return '—';
    return new Date(ts).toLocaleString('vi-VN');
  }

  render() {
    const { orders, loading, expandedId, summary, summaryLoading } = this.state;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Đơn hàng</h1>
        <p className="ad-page__lead">
          Theo dõi đơn đặt hàng. Nhấn một dòng để xem chi tiết sản phẩm.
        </p>

        <div className="ad-dash__grid" style={{ marginBottom: 18 }}>
          <div className="ad-dash-card ad-dash-card--static">
            <div className="ad-dash-card__icon ad-dash-card__icon--blue" aria-hidden>
              <FiDollarSign size={22} />
            </div>
            <h3 className="ad-dash-card__title">Doanh thu (đã duyệt)</h3>
            <div className="ad-dash-stat">
              {summaryLoading ? '—' : formatVnd(summary?.revenueApproved || 0)}
            </div>
            <p className="ad-dash-card__desc">Tổng tiền của các đơn có trạng thái APPROVED.</p>
          </div>
          <div className="ad-dash-card ad-dash-card--static">
            <div className="ad-dash-card__icon ad-dash-card__icon--amber" aria-hidden>
              <FiClock size={22} />
            </div>
            <h3 className="ad-dash-card__title">Đơn chờ duyệt</h3>
            <div className="ad-dash-stat">
              {summaryLoading ? '—' : (summary?.pending ?? 0)}
            </div>
            <p className="ad-dash-card__desc">Số đơn đang ở trạng thái PENDING.</p>
          </div>
          <div className="ad-dash-card ad-dash-card--static">
            <div className="ad-dash-card__icon ad-dash-card__icon--violet" aria-hidden>
              <FiBox size={22} />
            </div>
            <h3 className="ad-dash-card__title">Tổng đơn</h3>
            <div className="ad-dash-stat">
              {summaryLoading ? '—' : (summary?.orders ?? orders.length)}
            </div>
            <p className="ad-dash-card__desc">Tổng số đơn trong hệ thống.</p>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head">
            <h2 className="ad-card__title">Danh sách</h2>
          </div>
          <div className="ad-card__body">
            {loading ? (
              <p
                style={{
                  padding: '20px 18px',
                  margin: 0,
                  color: 'var(--ad-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Đang tải…
              </p>
            ) : (
              <>
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ngày</th>
                        <th>Khách</th>
                        <th>Điện thoại</th>
                        <th>Tổng</th>
                        <th>Trạng thái</th>
                        <th>Dòng</th>
                        <th style={{ width: 220 }}>Duyệt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((item) => {
                        const cust = item.customer || {};
                        const nLines = Array.isArray(item.items)
                          ? item.items.length
                          : 0;
                        const open = expandedId === item._id;
                        return (
                          <React.Fragment key={item._id}>
                            <tr
                              onClick={() => this.toggleExpand(item._id)}
                              style={{ cursor: 'pointer' }}
                              className={
                                open ? 'ad-table__row--active' : ''
                              }
                            >
                              <td className="ad-table__id" title={item._id}>
                                {item._id}
                              </td>
                              <td>{this.formatDate(item.cdate)}</td>
                              <td>{cust.name || '—'}</td>
                              <td>{cust.phone || '—'}</td>
                              <td>{formatVnd(item.total)}</td>
                              <td>{item.status || '—'}</td>
                              <td>{nLines}</td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <div className="ad-actions">
                                  <button
                                    type="button"
                                    className="ad-btn ad-btn--primary ad-btn--sm"
                                    disabled={String(item.status || '').toUpperCase() === 'APPROVED'}
                                    onClick={() => this.setStatus(item._id, 'APPROVED')}
                                  >
                                    Duyệt
                                  </button>
                                  <button
                                    type="button"
                                    className="ad-btn ad-btn--danger ad-btn--sm"
                                    disabled={String(item.status || '').toUpperCase() === 'CANCELLED'}
                                    onClick={() => this.setStatus(item._id, 'CANCELLED')}
                                  >
                                    Huỷ
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {open && nLines > 0 ? (
                              <tr className="ad-table__row--active">
                                <td colSpan={8} style={{ padding: '14px 18px' }}>
                                  <strong>Chi tiết:</strong>
                                  <ul
                                    style={{
                                      margin: '10px 0 0',
                                      paddingLeft: '1.2rem',
                                    }}
                                  >
                                    {item.items.map((line, idx) => (
                                      <li key={idx}>
                                        {line.product && line.product._id ? (
                                          <a
                                            href={customerProductPath(
                                              line.product
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {line.product.name || 'Sản phẩm'}
                                          </a>
                                        ) : line.product && line.product.name ? (
                                          line.product.name
                                        ) : (
                                          'Sản phẩm'
                                        )}{' '}
                                        × {line.quantity}
                                        {line.product && line.product.price != null
                                          ? ` — ${line.product.price * line.quantity}`
                                          : ''}
                                      </li>
                                    ))}
                                  </ul>
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {orders.length === 0 ? (
                  <p
                    style={{
                      padding: '20px 18px',
                      margin: 0,
                      color: 'var(--ad-muted)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Chưa có đơn hàng.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Order;
