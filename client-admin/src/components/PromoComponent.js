import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import PromoDetail from './PromoDetailComponent';

class Promo extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      promos: [],
      promoModal: null,
    };
  }

  componentDidMount() {
    this.apiGetPromos();
  }

  apiGetPromos() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/promos', config).then((res) => {
      this.setState({ promos: res.data || [] });
    });
  }

  openCreateModal = () => {
    this.setState({ promoModal: { mode: 'create' } });
  };

  openEditModal = (item) => {
    this.setState({ promoModal: { mode: 'edit', item } });
  };

  closeModal = () => {
    this.setState({ promoModal: null });
  };

  updatePromos = (promos) => {
    this.setState({ promos });
  };

  render() {
    const { promos, promoModal } = this.state;
    const activeId =
      promoModal && promoModal.mode === 'edit' && promoModal.item
        ? promoModal.item._id
        : null;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Mã khuyến mãi</h1>
        <p className="ad-page__lead">
          Quản lý promo code cho khách hàng áp dụng khi thanh toán. Nhấn một dòng
          để sửa trong hộp thoại.
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
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Loại</th>
                    <th>Giá trị</th>
                    <th>Đơn tối thiểu</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p) => (
                    <tr
                      key={p._id}
                      className={
                        activeId && activeId === p._id
                          ? 'ad-table__row--active'
                          : ''
                      }
                      onClick={() => this.openEditModal(p)}
                    >
                      <td style={{ fontWeight: 800, letterSpacing: '0.04em' }}>
                        {p.code}
                      </td>
                      <td>{String(p.type || '').toUpperCase()}</td>
                      <td>
                        {String(p.type || '').toUpperCase() === 'PERCENT'
                          ? `${Number(p.value) || 0}%`
                          : `${Number(p.value) || 0}`}
                      </td>
                      <td>{Number(p.minSubtotal) || 0}</td>
                      <td>
                        {p.active === 1 ? (
                          <span className="ad-pill ad-pill--ok">ACTIVE</span>
                        ) : (
                          <span className="ad-pill">OFF</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {promos.length === 0 ? (
              <p
                style={{
                  padding: '20px 18px',
                  margin: 0,
                  color: 'var(--ad-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Chưa có mã khuyến mãi. Nhấn &quot;Thêm mới&quot; để tạo mã đầu
                tiên.
              </p>
            ) : null}
          </div>
        </div>

        <PromoDetail
          isOpen={!!promoModal}
          mode={promoModal ? promoModal.mode : 'create'}
          item={promoModal && promoModal.mode === 'edit' ? promoModal.item : null}
          onClose={this.closeModal}
          updatePromos={this.updatePromos}
        />
      </div>
    );
  }
}

export default Promo;

