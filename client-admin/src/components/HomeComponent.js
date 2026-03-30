import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categoryCount: null,
      productPageInfo: null,
      loadError: false,
    };
  }

  componentDidMount() {
    this.loadStats();
  }

  loadStats() {
    const token = this.context.token;
    const config = { headers: { 'x-access-token': token } };

    axios
      .get('/api/admin/categories', config)
      .then((res) => {
        this.setState({ categoryCount: Array.isArray(res.data) ? res.data.length : 0 });
      })
      .catch(() => this.setState({ loadError: true }));

    axios
      .get('/api/admin/products?page=1', config)
      .then((res) => {
        const d = res.data || {};
        this.setState({
          productPageInfo: {
            noPages: d.noPages,
            onPage: (d.products && d.products.length) || 0,
          },
        });
      })
      .catch(() => {});
  }

  render() {
    const { categoryCount, productPageInfo, loadError } = this.state;
    const hour = new Date().getHours();
    let greet = 'Xin chào';
    if (hour < 12) greet = 'Chào buổi sáng';
    else if (hour < 18) greet = 'Chào buổi chiều';
    else greet = 'Chào buổi tối';

    const user = this.context.username || 'Quản trị viên';

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Tổng quan</h1>
        <p className="ad-page__lead">
          Theo dõi cửa hàng, cập nhật danh mục và sản phẩm từ một giao diện
          gọn gàng.
        </p>

        <div className="ad-dash__welcome">
          <h2>
            {greet}, {user}
          </h2>
          <p>
            Đây là bảng điều khiển ShopAdmin. Dùng menu bên trái để chuyển nhanh
            giữa các phân hệ. Trên mobile, chạm biểu tượng menu góc trái để mở
            thanh điều hướng.
          </p>
        </div>

        {loadError ? (
          <p className="ad-page__lead" style={{ color: '#b91c1c' }}>
            Không tải được số liệu tóm tắt. Kiểm tra API hoặc quyền truy cập.
          </p>
        ) : null}

        <div className="ad-dash__grid">
          <Link to="/admin/category" className="ad-dash-card">
            <span
              className="ad-dash-card__icon ad-dash-card__icon--blue"
              aria-hidden
            >
              ☰
            </span>
            <h3 className="ad-dash-card__title">Danh mục</h3>
            <p className="ad-dash-card__desc">
              Thêm, sửa và sắp xếp nhóm sản phẩm (gaming, văn phòng, v.v.).
            </p>
            <span className="ad-dash-card__meta">
              {categoryCount == null
                ? 'Đang tải…'
                : `${categoryCount} danh mục`}
            </span>
          </Link>

          <Link to="/admin/product" className="ad-dash-card">
            <span
              className="ad-dash-card__icon ad-dash-card__icon--violet"
              aria-hidden
            >
              ◫
            </span>
            <h3 className="ad-dash-card__title">Sản phẩm</h3>
            <p className="ad-dash-card__desc">
              Quản lý laptop: giá, hình ảnh và gán danh mục.
            </p>
            <span className="ad-dash-card__meta">
              {productPageInfo
                ? `${productPageInfo.noPages} trang · ${productPageInfo.onPage} SP/trang đầu`
                : 'Đang tải…'}
            </span>
          </Link>

          <div className="ad-dash-card ad-dash-card--static">
            <span
              className="ad-dash-card__icon ad-dash-card__icon--amber"
              aria-hidden
            >
              ✦
            </span>
            <h3 className="ad-dash-card__title">Đơn hàng</h3>
            <p className="ad-dash-card__desc">
              Phân hệ đơn hàng sẽ được kết nối trong bản cập nhật tiếp theo.
            </p>
            <span className="ad-dash-card__meta">Sắp ra mắt</span>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
