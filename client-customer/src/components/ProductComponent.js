import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import ProductCard from './ProductCard';

function safeDecodeKeyword(raw) {
  if (raw == null || raw === '') return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return String(raw);
  }
}

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categoryName: null
    };
  }

  render() {
    const { params } = this.props;
    const isCategory = !!params.cid;
    const keywordRaw = params.keyword || '';
    const keyword = safeDecodeKeyword(keywordRaw);

    let heading = 'Sản phẩm';
    let subtitle = '';

    if (isCategory) {
      heading = this.state.categoryName || 'Danh mục';
      subtitle = this.state.categoryName
        ? 'Các sản phẩm hiện có trong danh mục này.'
        : 'Đang tải danh sách sản phẩm…';
    } else {
      heading = 'Kết quả tìm kiếm';
      subtitle = keyword
        ? `Từ khóa: “${keyword}”`
        : 'Nhập từ khóa ở thanh tìm kiếm để xem sản phẩm.';
    }

    const showCategoryOnCard = !isCategory;

    return (
      <div className="cc-product-list-page align-center cc-home__section">
        <div className="cc-section-shell">
          <nav className="cc-product-list-page__crumb" aria-label="Breadcrumb">
            <Link to="/home">Trang chủ</Link>
            <span className="cc-product-list-page__crumb-sep" aria-hidden="true">
              /
            </span>
            <span>
              {isCategory
                ? this.state.categoryName || 'Danh mục'
                : 'Tìm kiếm'}
            </span>
          </nav>

          <header className="cc-product-list-page__head">
            <h1 className="text-center cc-section-heading">{heading}</h1>
            <p className="text-center cc-section-subtitle">{subtitle}</p>
          </header>

          {this.state.products.length === 0 ? (
            <div className="cc-product-list-page__empty">
              <p>Không tìm thấy sản phẩm nào phù hợp.</p>
              <Link to="/home" className="cc-product-list-page__empty-link">
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div className="cc-product-list-page__grid">
              {this.state.products.map((item) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  showCategoryMeta={showCategoryOnCard}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.loadFromParams();
  }

  componentDidUpdate(prevProps) {
    const p = this.props.params;
    const prev = prevProps.params;
    if (p.cid !== prev.cid || p.keyword !== prev.keyword) {
      this.loadFromParams();
    }
  }

  loadFromParams() {
    const params = this.props.params;
    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword != null && params.keyword !== '') {
      this.apiGetProductsByKeyword(params.keyword);
    } else {
      this.setState({ products: [], categoryName: null });
    }
  }

  apiGetProductsByCatID(cid) {
    this.setState({ products: [], categoryName: null });
    axios
      .get('/api/customer/products/category/' + encodeURIComponent(cid))
      .then((res) => {
      const result = res.data || [];
      let categoryName = null;
      if (
        result.length > 0 &&
        result[0].category &&
        result[0].category.name
      ) {
        categoryName = result[0].category.name;
      }
      this.setState({ products: result, categoryName });
      if (!categoryName) {
        axios.get('/api/customer/categories').then((r) => {
          const cats = r.data || [];
          const c = cats.find(
            (x) =>
              String(x._id) === String(cid) ||
              (x.slug != null && String(x.slug) === String(cid))
          );
          if (c && c.name) {
            this.setState({ categoryName: c.name });
          }
        });
      }
    });
  }

  apiGetProductsByKeyword(keyword) {
    axios.get('/api/customer/products/search/' + keyword).then((res) => {
      const result = res.data || [];
      this.setState({ products: result, categoryName: null });
    });
  }
}

export default withRouter(Product);
