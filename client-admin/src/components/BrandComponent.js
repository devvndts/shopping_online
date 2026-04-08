import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import BrandDetail from './BrandDetailComponent';

class Brand extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      brands: [],
      brandModal: null,
    };
  }

  componentDidMount() {
    this.apiGetBrands();
  }

  openCreateModal = () => {
    this.setState({ brandModal: { mode: 'create' } });
  };

  openEditModal = (item) => {
    this.setState({ brandModal: { mode: 'edit', item } });
  };

  closeModal = () => {
    this.setState({ brandModal: null });
  };

  updateBrands = (brands) => {
    this.setState({ brands });
  };

  apiGetBrands() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/brands', config).then((res) => {
      this.setState({ brands: res.data || [] });
    });
  }

  render() {
    const { brands, brandModal } = this.state;
    const activeId =
      brandModal && brandModal.mode === 'edit' && brandModal.item
        ? brandModal.item._id
        : null;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Thương hiệu</h1>
        <p className="ad-page__lead">
          Quản lý danh sách thương hiệu dùng chọn nhanh trong form sản phẩm. Có
          thể thêm mới ngay trong modal sản phẩm.
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
                    <th>ID</th>
                    <th>Tên thương hiệu</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((item) => (
                    <tr
                      key={item._id}
                      className={
                        activeId && activeId === item._id
                          ? 'ad-table__row--active'
                          : ''
                      }
                      onClick={() => this.openEditModal(item)}
                    >
                      <td className="ad-table__id" title={item._id}>
                        {item._id}
                      </td>
                      <td>{item.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {brands.length === 0 ? (
              <p
                style={{
                  padding: '20px 18px',
                  margin: 0,
                  color: 'var(--ad-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Chưa có thương hiệu. Nhấn &quot;Thêm mới&quot; hoặc tạo trong
                modal sản phẩm.
              </p>
            ) : null}
          </div>
        </div>

        <BrandDetail
          isOpen={!!brandModal}
          mode={brandModal ? brandModal.mode : 'create'}
          item={
            brandModal && brandModal.mode === 'edit' ? brandModal.item : null
          }
          onClose={this.closeModal}
          updateBrands={this.updateBrands}
        />
      </div>
    );
  }
}

export default Brand;
