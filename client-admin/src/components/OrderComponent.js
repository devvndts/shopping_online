import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = { orders: [], loading: true, expandedId: null };
  }

  componentDidMount() {
    this.apiGetOrders();
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
    const { orders, loading, expandedId } = this.state;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Đơn hàng</h1>
        <p className="ad-page__lead">
          Theo dõi đơn đặt hàng. Nhấn một dòng để xem chi tiết sản phẩm.
        </p>

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
                              <td>{item.total}</td>
                              <td>{item.status || '—'}</td>
                              <td>{nLines}</td>
                            </tr>
                            {open && nLines > 0 ? (
                              <tr className="ad-table__row--active">
                                <td colSpan={7} style={{ padding: '14px 18px' }}>
                                  <strong>Chi tiết:</strong>
                                  <ul
                                    style={{
                                      margin: '10px 0 0',
                                      paddingLeft: '1.2rem',
                                    }}
                                  >
                                    {item.items.map((line, idx) => (
                                      <li key={idx}>
                                        {line.product && line.product.name
                                          ? line.product.name
                                          : 'Sản phẩm'}{' '}
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
