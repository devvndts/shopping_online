import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import {
  FiBox,
  FiGrid,
  FiLayers,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiSliders,
  FiStar,
  FiSettings,
} from 'react-icons/fi';
import { formatVnd } from '../utils/formatVnd';

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categoryCount: null,
      productCount: null,
      customerCount: null,
      slideCount: null,
      reviewCount: null,
      orderSummary: null,
      loadError: false,
    };
  }

  componentDidMount() {
    this.loadStats();
  }

  loadStats() {
    const token = this.context.token;
    const config = { headers: { 'x-access-token': token } };

    const safeLen = (x) => (Array.isArray(x) ? x.length : 0);

    axios
      .get('/api/admin/categories', config)
      .then((res) => this.setState({ categoryCount: safeLen(res.data) }))
      .catch(() => this.setState({ loadError: true }));

    axios
      .get('/api/admin/products/all', config)
      .then((res) => this.setState({ productCount: safeLen(res.data) }))
      .catch(() => {});

    axios
      .get('/api/admin/customers', config)
      .then((res) => this.setState({ customerCount: safeLen(res.data) }))
      .catch(() => {});

    axios
      .get('/api/admin/slides', config)
      .then((res) => this.setState({ slideCount: safeLen(res.data) }))
      .catch(() => {});

    axios
      .get('/api/admin/reviews', config)
      .then((res) => this.setState({ reviewCount: safeLen(res.data) }))
      .catch(() => {});

    axios
      .get('/api/admin/orders/summary', config)
      .then((res) => this.setState({ orderSummary: res.data || null }))
      .catch(() => {});
  }

  render() {
    const {
      categoryCount,
      productCount,
      customerCount,
      slideCount,
      reviewCount,
      orderSummary,
      loadError,
    } = this.state;
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

        <div className="ad-dash__grid" style={{ marginBottom: 18 }}>
          <div className="ad-dash-card ad-dash-card--static">
            <span className="ad-dash-card__icon ad-dash-card__icon--blue" aria-hidden>
              <FiDollarSign size={22} />
            </span>
            <h3 className="ad-dash-card__title">Doanh thu (đã duyệt)</h3>
            <div className="ad-dash-stat">
              {orderSummary ? formatVnd(orderSummary.revenueApproved || 0) : '—'}
            </div>
            <p className="ad-dash-card__desc">Tính trên các đơn có trạng thái APPROVED.</p>
          </div>

          <div className="ad-dash-card ad-dash-card--static">
            <span className="ad-dash-card__icon ad-dash-card__icon--amber" aria-hidden>
              <FiClock size={22} />
            </span>
            <h3 className="ad-dash-card__title">Đơn chờ duyệt</h3>
            <div className="ad-dash-stat">{orderSummary ? (orderSummary.pending ?? 0) : '—'}</div>
            <p className="ad-dash-card__desc">Ưu tiên xử lý để tránh tồn đơn.</p>
          </div>

          <div className="ad-dash-card ad-dash-card--static">
            <span className="ad-dash-card__icon ad-dash-card__icon--violet" aria-hidden>
              <FiBox size={22} />
            </span>
            <h3 className="ad-dash-card__title">Tổng đơn</h3>
            <div className="ad-dash-stat">{orderSummary ? (orderSummary.orders ?? 0) : '—'}</div>
            <p className="ad-dash-card__desc">Tổng số đơn trong hệ thống.</p>
          </div>
        </div>

        <div className="ad-dash__grid">
          <Link to="/admin/category" className="ad-dash-card">
            <span
              className="ad-dash-card__icon ad-dash-card__icon--blue"
              aria-hidden
            >
              <FiLayers size={22} />
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
              <FiGrid size={22} />
            </span>
            <h3 className="ad-dash-card__title">Sản phẩm</h3>
            <p className="ad-dash-card__desc">
              Quản lý laptop: giá, hình ảnh và gán danh mục.
            </p>
            <span className="ad-dash-card__meta">
              {productCount == null ? 'Đang tải…' : `${productCount} sản phẩm`}
            </span>
          </Link>

          <Link to="/admin/orders" className="ad-dash-card">
            <span
              className="ad-dash-card__icon ad-dash-card__icon--amber"
              aria-hidden
            >
              <FiClock size={22} />
            </span>
            <h3 className="ad-dash-card__title">Đơn hàng</h3>
            <p className="ad-dash-card__desc">
              Duyệt đơn, theo dõi trạng thái và xem chi tiết từng đơn.
            </p>
            <span className="ad-dash-card__meta">
              {orderSummary ? `${orderSummary.pending ?? 0} chờ duyệt` : 'Mở quản lý đơn'}
            </span>
          </Link>

          <Link to="/admin/customers" className="ad-dash-card">
            <span className="ad-dash-card__icon ad-dash-card__icon--blue" aria-hidden>
              <FiUsers size={22} />
            </span>
            <h3 className="ad-dash-card__title">Khách hàng</h3>
            <p className="ad-dash-card__desc">Quản lý tài khoản, trạng thái hoạt động và thông tin liên hệ.</p>
            <span className="ad-dash-card__meta">
              {customerCount == null ? 'Đang tải…' : `${customerCount} khách hàng`}
            </span>
          </Link>

          <Link to="/admin/slides" className="ad-dash-card">
            <span className="ad-dash-card__icon ad-dash-card__icon--violet" aria-hidden>
              <FiSliders size={22} />
            </span>
            <h3 className="ad-dash-card__title">Slides</h3>
            <p className="ad-dash-card__desc">Quản trị banner trang chủ (ảnh, link, bật/tắt, sắp xếp).</p>
            <span className="ad-dash-card__meta">
              {slideCount == null ? 'Đang tải…' : `${slideCount} slide`}
            </span>
          </Link>

          <Link to="/admin/reviews" className="ad-dash-card">
            <span className="ad-dash-card__icon ad-dash-card__icon--amber" aria-hidden>
              <FiStar size={22} />
            </span>
            <h3 className="ad-dash-card__title">Đánh giá</h3>
            <p className="ad-dash-card__desc">Duyệt/ẩn đánh giá sản phẩm hiển thị trên client-customer.</p>
            <span className="ad-dash-card__meta">
              {reviewCount == null ? 'Đang tải…' : `${reviewCount} đánh giá`}
            </span>
          </Link>

          <Link to="/admin/settings" className="ad-dash-card">
            <span className="ad-dash-card__icon ad-dash-card__icon--blue" aria-hidden>
              <FiSettings size={22} />
            </span>
            <h3 className="ad-dash-card__title">Giao diện</h3>
            <p className="ad-dash-card__desc">Cấu hình ảnh nền đăng nhập/đăng ký và thiết lập giao diện.</p>
            <span className="ad-dash-card__meta">Cập nhật nhanh</span>
          </Link>
        </div>
      </div>
    );
  }
}

export default Home;
