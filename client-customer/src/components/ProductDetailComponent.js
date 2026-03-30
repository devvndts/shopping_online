import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';
import { notifySuccess, notifyWarning } from '../utils/notify';
import { formatVnd } from '../utils/formatVnd';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      status: 'loading',
      txtQuantity: 1
    };
  }

  clampQty(n) {
    const x = parseInt(n, 10);
    if (Number.isNaN(x)) return 1;
    return Math.min(99, Math.max(1, x));
  }

  qtyDelta(delta) {
    this.setState((s) => ({
      txtQuantity: this.clampQty(s.txtQuantity + delta)
    }));
  }

  onQtyInputChange(e) {
    const raw = e.target.value;
    const n = parseInt(raw, 10);
    if (raw === '' || Number.isNaN(n)) {
      this.setState({ txtQuantity: 1 });
      return;
    }
    this.setState({ txtQuantity: this.clampQty(n) });
  }

  onQtyInputBlur() {
    this.setState((s) => ({ txtQuantity: this.clampQty(s.txtQuantity) }));
  }

  render() {
    const { status, product } = this.state;

    if (status === 'loading') {
      return (
        <div className="cc-pdp align-center cc-home__section">
          <div className="cc-section-shell cc-pdp__shell">
            <div className="cc-pdp-state cc-pdp-state--loading">
              Đang tải sản phẩm…
            </div>
          </div>
        </div>
      );
    }

    if (status === 'error' || status === 'notfound' || !product) {
      return (
        <div className="cc-pdp align-center cc-home__section">
          <div className="cc-section-shell cc-pdp__shell">
            <div className="cc-pdp-state cc-pdp-state--error">
              <h1 className="cc-pdp-state__title">
                {status === 'notfound'
                  ? 'Không tìm thấy sản phẩm'
                  : 'Có lỗi xảy ra'}
              </h1>
              <p className="cc-pdp-state__text">
                {status === 'notfound'
                  ? 'Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng.'
                  : 'Vui lòng kiểm tra kết nối và thử lại sau.'}
              </p>
              <Link to="/home" className="cc-pdp-state__link">
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const prod = product;
    const cat = prod.category || {};
    const catId = cat._id ? String(cat._id) : '';
    const catName = cat.name || 'Danh mục';

    return (
      <div className="cc-pdp align-center cc-home__section">
        <div className="cc-section-shell cc-pdp__shell">
          <nav className="cc-pdp__crumb" aria-label="Breadcrumb">
            <Link to="/home">Trang chủ</Link>
            <span className="cc-pdp__crumb-sep" aria-hidden="true">
              /
            </span>
            {catId ? (
              <>
                <Link to={'/product/category/' + catId}>{catName}</Link>
                <span className="cc-pdp__crumb-sep" aria-hidden="true">
                  /
                </span>
              </>
            ) : null}
            <span className="cc-pdp__crumb-current">{prod.name}</span>
          </nav>

          <div className="cc-pdp__grid">
            <div className="cc-pdp__gallery">
              <div className="cc-pdp__img-stage">
                <img
                  className="cc-pdp__img"
                  src={'data:image/jpg;base64,' + prod.image}
                  alt={prod.name}
                />
              </div>
            </div>

            <div className="cc-pdp__info">
              {catId ? (
                <p className="cc-pdp__cat">
                  <Link
                    to={'/product/category/' + catId}
                    className="cc-pdp__cat-link"
                  >
                    {catName}
                  </Link>
                </p>
              ) : null}

              <h1 className="cc-pdp__title">{prod.name}</h1>

              <p className="cc-pdp__price">
                {formatVnd(prod.price)}
                <span className="cc-pdp__price-note">
                  Giá hiển thị là giá bán lẻ; khuyến mãi (nếu có) áp dụng khi
                  thanh toán.
                </span>
              </p>

              <div className="cc-pdp__meta-block">
                <div className="cc-pdp__meta-row">
                  <span className="cc-pdp__meta-label">Danh mục</span>
                  <span className="cc-pdp__meta-value">{catName}</span>
                </div>
              </div>

              <div>
                <label className="cc-pdp__qty-label" htmlFor="cc-pdp-qty">
                  Số lượng
                </label>
                <div className="cc-pdp__qty-control">
                  <button
                    type="button"
                    className="cc-pdp__qty-btn"
                    aria-label="Giảm số lượng"
                    onClick={() => this.qtyDelta(-1)}
                  >
                    −
                  </button>
                  <input
                    id="cc-pdp-qty"
                    className="cc-pdp__qty-input"
                    type="number"
                    min={1}
                    max={99}
                    value={this.state.txtQuantity}
                    onChange={(e) => this.onQtyInputChange(e)}
                    onBlur={() => this.onQtyInputBlur()}
                  />
                  <button
                    type="button"
                    className="cc-pdp__qty-btn"
                    aria-label="Tăng số lượng"
                    onClick={() => this.qtyDelta(1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cc-pdp__actions">
                <button
                  type="button"
                  className="cc-pdp__add"
                  onClick={(e) => this.btnAdd2CartClick(e)}
                >
                  Thêm vào giỏ hàng
                </button>
                <Link to="/mycart" className="cc-pdp__to-cart">
                  Xem giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.apiGetProduct(this.props.params.id);
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.id !== prevProps.params.id) {
      this.setState({ product: null, status: 'loading', txtQuantity: 1 });
      this.apiGetProduct(this.props.params.id);
    }
  }

  apiGetProduct(id) {
    if (!id) {
      this.setState({ product: null, status: 'notfound' });
      return;
    }
    axios
      .get('/api/customer/products/' + id)
      .then((res) => {
        const result = res.data;
        if (!result || !result._id) {
          this.setState({ product: null, status: 'notfound' });
          return;
        }
        this.setState({
          product: result,
          status: 'ready',
          txtQuantity: 1
        });
      })
      .catch(() => {
        this.setState({ product: null, status: 'error' });
      });
  }

  btnAdd2CartClick(e) {
    e.preventDefault();
    const product = this.state.product;
    if (!product) return;

    const quantity = this.clampQty(this.state.txtQuantity);
    if (!quantity || quantity < 1) {
      notifyWarning('Vui lòng nhập số lượng hợp lệ (1–99).');
      return;
    }

    const mycart = this.context.mycart;
    const index = mycart.findIndex((x) => x.product._id === product._id);

    let next;
    if (index === -1) {
      next = [...mycart, { product, quantity }];
    } else {
      next = mycart.map((row, i) =>
        i === index
          ? { ...row, quantity: row.quantity + quantity }
          : row
      );
    }

    this.context.setMycart(next);
    notifySuccess('Đã thêm sản phẩm vào giỏ hàng.');
  }
}

export default withRouter(ProductDetail);
