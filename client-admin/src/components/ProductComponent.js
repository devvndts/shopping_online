import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';
import { formatVnd } from '../utils/formatVnd';
import { customerProductPath } from '../utils/customerProductPath';
import { productImageSrc } from '../utils/productImageSrc';

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      productModal: null,
    };
  }

  updateProducts = (products, noPages, curPage) => {
    this.setState({
      products: products || [],
      noPages: typeof noPages === 'number' ? noPages : 0,
      curPage: typeof curPage === 'number' ? curPage : this.state.curPage,
    });
  };

  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }

  openCreateModal = () => {
    this.setState({ productModal: { mode: 'create' } });
  };

  openEditModal = (item) => {
    this.setState({ productModal: { mode: 'edit', item } });
  };

  closeModal = () => {
    this.setState({ productModal: null });
  };

  lnkPageClick(page) {
    this.apiGetProducts(page);
    this.setState({ productModal: null });
  }

  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/products?page=' + page, config)
      .then((res) => {
        const result = res.data || {};
        this.setState({
          products: result.products || [],
          noPages: result.noPages || 0,
          curPage: result.curPage || page,
        });
      });
  }

  render() {
    const { products, noPages, curPage, productModal } = this.state;

    const pages =
      noPages > 0 ? Array.from({ length: noPages }, (_, i) => i + 1) : [];

    const activeId =
      productModal && productModal.mode === 'edit' && productModal.item
        ? productModal.item._id
        : null;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Sản phẩm</h1>
        <p className="ad-page__lead">
          4 sản phẩm / trang. Nhấn dòng để sửa trong hộp thoại, hoặc &quot;Thêm
          mới&quot;.
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
                    <th>Tên</th>
                    <th>Brand</th>
                    <th>Giá</th>
                    <th>Ngày tạo</th>
                    <th>Danh mục</th>
                    <th>Ảnh</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
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
                      <td>{item.brand || '—'}</td>
                      <td>{formatVnd(item.price)}</td>
                      <td>
                        {item.cdate
                          ? new Date(item.cdate).toLocaleString('vi-VN')
                          : '—'}
                      </td>
                      <td>
                        {item.category && item.category.name
                          ? item.category.name
                          : '—'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                          {item.slug ? (
                            <code title={item.slug}>{item.slug}</code>
                          ) : (
                            <span style={{ color: 'var(--ad-muted)' }}>—</span>
                          )}
                          <div style={{ marginTop: 6 }}>
                            <a
                              href={customerProductPath(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ad-table__ext-link"
                            >
                              Mở trên cửa hàng
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.image ? (
                          <img
                            className="ad-table__thumb"
                            src={productImageSrc(item.image)}
                            alt=""
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {noPages > 0 ? (
              <div className="ad-pagination">
                <span className="ad-pagination__label">Trang:</span>
                {pages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={
                      'ad-pagination__btn' +
                      (p === curPage ? ' ad-pagination__btn--active' : '')
                    }
                    onClick={() => this.lnkPageClick(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <p
                style={{
                  padding: '20px 18px',
                  margin: 0,
                  color: 'var(--ad-muted)',
                  fontSize: '0.9rem',
                }}
              >
                Chưa có sản phẩm hoặc chưa tải được dữ liệu.
              </p>
            )}
          </div>
        </div>

        <ProductDetail
          isOpen={!!productModal}
          mode={productModal ? productModal.mode : 'create'}
          item={
            productModal && productModal.mode === 'edit'
              ? productModal.item
              : null
          }
          curPage={curPage}
          updateProducts={this.updateProducts}
          onClose={this.closeModal}
        />
      </div>
    );
  }
}

export default Product;
