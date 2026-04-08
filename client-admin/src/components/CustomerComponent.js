import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CustomerDetail from './CustomerDetailComponent';
import { notifyPromise } from '../utils/notify';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      loading: true,
      customerModal: null,
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  openCreateModal = () => {
    this.setState({ customerModal: { mode: 'create' } });
  };

  openEditModal = (item) => {
    this.setState({ customerModal: { mode: 'edit', item } });
  };

  closeModal = () => {
    this.setState({ customerModal: null });
  };

  updateCustomers = (customers) => {
    this.setState({ customers });
  };

  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/customers', config)
      .then((res) => {
        this.setState({ customers: res.data || [], loading: false });
      })
      .catch(() => {
        this.setState({ customers: [], loading: false });
      });
  }

  toggleActive = (e, item) => {
    e.stopPropagation();
    const isOn = item.active === 1 || item.active === true;
    const next = isOn ? 0 : 1;
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios
      .patch(`/api/admin/customers/${item._id}/active`, { active: next }, config)
      .then((res) => {
        if (!(res.data && res.data._id)) throw new Error('Cập nhật thất bại.');
        this.setState((s) => ({
          customers: s.customers.map((c) =>
            c._id === res.data._id ? { ...c, ...res.data } : c
          ),
        }));
      });
    notifyPromise(p, {
      pending: 'Đang cập nhật trạng thái…',
      success: next ? 'Đã bật kích hoạt.' : 'Đã tắt kích hoạt.',
      error: 'Cập nhật trạng thái khách hàng thất bại.',
    });
  };

  render() {
    const { customers, loading, customerModal } = this.state;
    const activeId =
      customerModal &&
      customerModal.mode === 'edit' &&
      customerModal.item
        ? customerModal.item._id
        : null;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Khách hàng</h1>
        <p className="ad-page__lead">
          Thêm, sửa, xoá và kích hoạt / vô hiệu tài khoản khách hàng. Nhấn dòng
          để sửa trong hộp thoại; nút trong cột kích hoạt để bật/tắt nhanh.
        </p>

        <div className="ad-card">
          <div className="ad-card__head ad-card__head--row">
            <h2 className="ad-card__title">Danh sách</h2>
            <button
              type="button"
              className="ad-btn ad-btn--ghost"
              onClick={this.openCreateModal}
            >
              + Thêm mới
            </button>
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
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Kích hoạt</th>
                        <th style={{ width: '140px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((item) => {
                        const on =
                          item.active === 1 || item.active === true;
                        return (
                          <tr
                            key={item._id}
                            className={
                              activeId && activeId === item._id
                                ? 'ad-table__row--active'
                                : ''
                            }
                            onClick={() => this.openEditModal(item)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="ad-table__id" title={item._id}>
                              {item._id}
                            </td>
                            <td>{item.username}</td>
                            <td>{item.name}</td>
                            <td>{item.phone}</td>
                            <td>{item.email}</td>
                            <td>{on ? 'Có' : 'Không'}</td>
                            <td>
                              <button
                                type="button"
                                className={
                                  'ad-btn ad-btn--ghost' +
                                  (on ? '' : ' ad-btn--neutral')
                                }
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '6px 10px',
                                }}
                                onClick={(e) => this.toggleActive(e, item)}
                              >
                                {on ? 'Vô hiệu' : 'Kích hoạt'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {customers.length === 0 ? (
                  <p
                    style={{
                      padding: '20px 18px',
                      margin: 0,
                      color: 'var(--ad-muted)',
                      fontSize: '0.9rem',
                    }}
                  >
                    Chưa có khách hàng. Dùng &quot;Thêm mới&quot; để tạo tài
                    khoản.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>

        <CustomerDetail
          isOpen={!!customerModal}
          mode={customerModal ? customerModal.mode : 'create'}
          item={
            customerModal && customerModal.mode === 'edit'
              ? customerModal.item
              : null
          }
          onClose={this.closeModal}
          updateCustomers={this.updateCustomers}
        />
      </div>
    );
  }
}

export default Customer;
