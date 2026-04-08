import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';
import { customerCategoryPath } from '../utils/customerProductPath';

class Category extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      categoryModal: null,
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  openCreateModal = () => {
    this.setState({ categoryModal: { mode: 'create' } });
  };

  openEditModal = (item) => {
    this.setState({ categoryModal: { mode: 'edit', item } });
  };

  closeModal = () => {
    this.setState({ categoryModal: null });
  };

  updateCategories = (categories) => {
    this.setState({ categories });
  };

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data || [] });
    });
  }

  render() {
    const { categories, categoryModal } = this.state;
    const activeId =
      categoryModal && categoryModal.mode === 'edit' && categoryModal.item
        ? categoryModal.item._id
        : null;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Danh mục</h1>
        <p className="ad-page__lead">
          Nhấn một dòng để sửa trong hộp thoại. Dùng &quot;Thêm mới&quot; để tạo
          danh mục.
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
                    <th>Tên danh mục</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((item) => (
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
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                          {item.slug ? (
                            <code title={item.slug}>{item.slug}</code>
                          ) : (
                            <span style={{ color: 'var(--ad-muted)' }}>—</span>
                          )}
                          <div style={{ marginTop: 6 }}>
                            <a
                              href={customerCategoryPath(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ad-table__ext-link"
                            >
                              Mở trên cửa hàng
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {categories.length === 0 ? (
              <p
                style={{
                  padding: '20px 18px',
                  margin: 0,
                  color: 'var(--ad-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Chưa có danh mục. Nhấn &quot;Thêm mới&quot; để bắt đầu.
              </p>
            ) : null}
          </div>
        </div>

        <CategoryDetail
          isOpen={!!categoryModal}
          mode={categoryModal ? categoryModal.mode : 'create'}
          item={
            categoryModal && categoryModal.mode === 'edit'
              ? categoryModal.item
              : null
          }
          onClose={this.closeModal}
          updateCategories={this.updateCategories}
        />
      </div>
    );
  }
}

export default Category;
