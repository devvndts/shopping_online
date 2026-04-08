import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Mousewheel, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from '../utils/notify';
import { formatVnd } from '../utils/formatVnd';
import { productPath } from '../utils/productPath';
import { categoryPath } from '../utils/categoryPath';
import { productImageSrc } from '../utils/productImageSrc';
import { productGallerySrcs } from '../utils/productGallerySrcs';
import ProductCard from './ProductCard';
import { FiCheckCircle, FiZap, FiCreditCard } from 'react-icons/fi';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      product: null,
      status: 'loading',
      txtQuantity: 1,
      related: [],
      relatedLoading: false,
      tab: 'detail', // detail | reviews
      reviews: [],
      reviewsLoading: false,
      reviewStars: 5,
      reviewContent: '',
      reviewSubmitting: false,
      descExpanded: false,
      pdpSlide: 0,
      pdpThumbSpvDesktop: 6,
    };
    this._pdpSwiper = null;
    this._pdpThumbSwiper = null;
    this._onResize = null;
  }

  calcPdpThumbSpvDesktop() {
    try {
      const h = window.innerHeight || 800;
      // Màn hình thấp (ví dụ 400px) → chỉ 3 thumb cho gọn
      return h <= 440 ? 3 : 6;
    } catch {
      return 6;
    }
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
    const reviews = this.state.reviews || [];
    const avgStars =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + (parseInt(r.stars, 10) || 0), 0) /
              reviews.length) *
              10
          ) / 10
        : 0;

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
                <Link to={categoryPath(cat)}>{catName}</Link>
                <span className="cc-pdp__crumb-sep" aria-hidden="true">
                  /
                </span>
              </>
            ) : null}
            <span className="cc-pdp__crumb-current">{prod.name}</span>
          </nav>

          <div className="cc-pdp__grid">
            <div className="cc-pdp__gallery">
              {this.renderProductGallery(prod)}
            </div>

            <div className="cc-pdp__info">
              <div className="cc-pdp__buybox" aria-label="Khu vực mua hàng">
                <div className="cc-pdp__buybox-top">
                  {catId ? (
                    <p className="cc-pdp__cat">
                      <Link to={categoryPath(cat)} className="cc-pdp__cat-link">
                        {catName}
                      </Link>
                    </p>
                  ) : null}

                  <h1 className="cc-pdp__title">{prod.name}</h1>

                  <div className="cc-pdp__subhead">
                    {prod.brand ? <p className="cc-pdp__brand">{prod.brand}</p> : null}
                    {reviews.length ? (
                      <button
                        type="button"
                        className="cc-pdp__rating-link"
                        onClick={() => this.setState({ tab: 'reviews' })}
                        aria-label={`Xem đánh giá: ${avgStars}/5 từ ${reviews.length} lượt`}
                      >
                        <span className="cc-stars" aria-hidden="true">
                          {this.renderStars(avgStars)}
                        </span>
                        <span className="cc-pdp__rating-link-text">
                          {avgStars}/5 · {reviews.length}
                        </span>
                      </button>
                    ) : (
                      <span className="cc-pdp__rating-link cc-pdp__rating-link--muted">
                        Chưa có đánh giá
                      </span>
                    )}
                  </div>

                  <p className="cc-pdp__price">
                    {formatVnd(prod.price)}
                    <span className="cc-pdp__price-note">
                      Giá hiển thị là giá bán lẻ; khuyến mãi (nếu có) áp dụng khi thanh toán.
                    </span>
                  </p>
                </div>

                <div className="cc-pdp__perks" aria-label="Cam kết & tiện ích">
                  <div className="cc-pdp__perk">
                    <span className="cc-pdp__perk-ico" aria-hidden="true">
                      <FiCheckCircle />
                    </span>
                    <span className="cc-pdp__perk-text">Đổi trả linh hoạt nếu sản phẩm lỗi</span>
                  </div>
                  <div className="cc-pdp__perk">
                    <span className="cc-pdp__perk-ico" aria-hidden="true">
                      <FiZap />
                    </span>
                    <span className="cc-pdp__perk-text">Xử lý đơn nhanh, hỗ trợ tận tình</span>
                  </div>
                  <div className="cc-pdp__perk">
                    <span className="cc-pdp__perk-ico" aria-hidden="true">
                      <FiCreditCard />
                    </span>
                    <span className="cc-pdp__perk-text">Thanh toán COD hoặc Chuyển khoản</span>
                  </div>
                </div>

                <div className="cc-pdp__meta-block">
                  <div className="cc-pdp__meta-row">
                    <span className="cc-pdp__meta-label">Danh mục</span>
                    <span className="cc-pdp__meta-value">{catName}</span>
                  </div>
                </div>

                <div className="cc-pdp__qty">
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

          <section className="cc-pdp__panel" aria-label="Thông tin & đánh giá">
            <div className="cc-pdp__tabs" role="tablist" aria-label="Tabs sản phẩm">
              <button
                type="button"
                role="tab"
                aria-selected={this.state.tab === 'detail' ? 'true' : 'false'}
                className={
                  'cc-pdp__tab' + (this.state.tab === 'detail' ? ' cc-pdp__tab--active' : '')
                }
                onClick={() => this.setState({ tab: 'detail' })}
              >
                Thông tin chi tiết
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={this.state.tab === 'reviews' ? 'true' : 'false'}
                className={
                  'cc-pdp__tab' + (this.state.tab === 'reviews' ? ' cc-pdp__tab--active' : '')
                }
                onClick={() => this.setState({ tab: 'reviews' })}
              >
                Đánh giá {reviews.length ? `(${reviews.length})` : ''}
              </button>
              <div className="cc-pdp__tabs-spacer" />
              {reviews.length ? (
                <div className="cc-pdp__rating" aria-label="Điểm đánh giá trung bình">
                  <span className="cc-stars" aria-hidden="true">
                    {this.renderStars(avgStars)}
                  </span>
                  <span className="cc-pdp__rating-text">
                    {avgStars}/5 · {reviews.length} đánh giá
                  </span>
                </div>
              ) : null}
            </div>

            {this.state.tab === 'detail' ? (
              <div className="cc-pdp__tab-body" role="tabpanel">
                <h2 className="cc-pdp__panel-title">Mô tả</h2>
                {this.renderDescription(prod)}
              </div>
            ) : (
              <div className="cc-pdp__tab-body" role="tabpanel">
                <h2 className="cc-pdp__panel-title">Đánh giá sản phẩm</h2>

                {this.renderReviewComposer(prod)}

                {this.state.reviewsLoading ? (
                  <div className="cc-pdp__reviews-state">Đang tải đánh giá…</div>
                ) : reviews.length === 0 ? (
                  <div className="cc-pdp__reviews-empty">
                    Chưa có đánh giá nào cho sản phẩm này.
                  </div>
                ) : (
                  <div className="cc-pdp__reviews">
                    {reviews.map((r) => (
                      <article key={r._id} className="cc-pdp__review">
                        <div className="cc-pdp__review-row">
                          <div className="cc-pdp__review-avatar" aria-hidden="true">
                            {this.getInitials(r.author || 'Ẩn danh')}
                          </div>
                          <div className="cc-pdp__review-main">
                            <header className="cc-pdp__review-head">
                              <div className="cc-pdp__review-ident">
                                <div className="cc-pdp__review-author">
                                  {r.author || 'Ẩn danh'}
                                </div>
                                {r.cdate ? (
                                  <div className="cc-pdp__review-date">
                                    {new Date(r.cdate).toLocaleDateString('vi-VN')}
                                  </div>
                                ) : null}
                              </div>
                              <div className="cc-pdp__review-stars" aria-label={`${r.stars}/5`}>
                                <span className="cc-stars" aria-hidden="true">
                                  {this.renderStars(r.stars)}
                                </span>
                                <span className="cc-pdp__review-score">
                                  {Math.min(5, Math.max(1, parseInt(r.stars, 10) || 5))}.0
                                </span>
                              </div>
                            </header>
                            <div className="cc-pdp__review-content">{r.content}</div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {this.renderRelated(prod)}
        </div>
      </div>
    );
  }

  renderProductGallery(prod) {
    const gallerySrcs = productGallerySrcs(prod);
    const mainSrc = gallerySrcs[0] || productImageSrc(prod.image);
    const multi = gallerySrcs.length > 1;

    if (!multi) {
      return (
        <div className="cc-pdp__img-stage">
          <img className="cc-pdp__img" src={mainSrc} alt={prod.name} loading="eager" />
        </div>
      );
    }

    return (
      <div className="cc-pdp__gallery-inner">
        <div className="cc-pdp__gallery-layout" aria-label="Bộ sưu tập hình ảnh">
          <div className="cc-pdp__thumbs-col">
            <Swiper
              modules={[Keyboard, Mousewheel, A11y]}
              className="cc-pdp__thumbs-swiper"
              spaceBetween={10}
              slidesPerView={6}
              mousewheel={{ forceToAxis: true }}
              keyboard={{ enabled: true }}
              breakpoints={{
                900: {
                  direction: 'vertical',
                  slidesPerView: this.state.pdpThumbSpvDesktop,
                },
              }}
              onSwiper={(sw) => {
                this._pdpThumbSwiper = sw;
              }}
            >
              {gallerySrcs.map((src, i) => (
                <SwiperSlide key={`thumb-${i}`}>
                  <button
                    type="button"
                    aria-pressed={this.state.pdpSlide === i ? 'true' : 'false'}
                    aria-label={`Ảnh ${i + 1}`}
                    className={
                      'cc-pdp__thumb' +
                      (this.state.pdpSlide === i ? ' cc-pdp__thumb--active' : '')
                    }
                    onClick={() => {
                      if (this._pdpSwiper) this._pdpSwiper.slideTo(i);
                      this.setState({ pdpSlide: i });
                      if (this._pdpThumbSwiper) this._pdpThumbSwiper.slideTo(i);
                    }}
                  >
                    <img src={src} alt="" />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="cc-pdp__stage-col">
            <Swiper
              key={
                String(prod._id || '') +
                '-' +
                gallerySrcs.map((s) => s.slice(-24)).join('.')
              }
              modules={[Pagination, Navigation, Keyboard, A11y]}
              spaceBetween={12}
              slidesPerView={1}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation
              keyboard={{ enabled: true }}
              className="cc-pdp__swiper"
              onSwiper={(sw) => {
                this._pdpSwiper = sw;
              }}
              onSlideChange={(sw) => {
                this.setState({ pdpSlide: sw.activeIndex });
                if (this._pdpThumbSwiper) this._pdpThumbSwiper.slideTo(sw.activeIndex);
              }}
            >
              {gallerySrcs.map((src, i) => (
                <SwiperSlide key={`${src}-${i}`}>
                  <div className="cc-pdp__slide-frame">
                    <img
                      className="cc-pdp__img"
                      src={src}
                      alt={`${prod.name} — ảnh ${i + 1}/${gallerySrcs.length}`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    );
  }

  renderStars(stars) {
    const s = Math.round(Math.min(5, Math.max(0, Number(stars) || 0)));
    return '★'.repeat(s) + '☆'.repeat(5 - s);
  }

  renderDescription(prod) {
    const text = ((prod && prod.description) || '').trim();
    if (!text) {
      return <p className="cc-pdp__desc">Chưa có mô tả cho sản phẩm này.</p>;
    }

    const long = text.length > 360;
    const expanded = !!this.state.descExpanded;

    return (
      <div className={'cc-pdp__desc-wrap' + (expanded ? ' cc-pdp__desc-wrap--open' : '')}>
        <p className="cc-pdp__desc">{text}</p>

        {long && !expanded ? <div className="cc-pdp__desc-fade" aria-hidden="true" /> : null}

        {long ? (
          <div className="cc-pdp__desc-more">
            <button
              type="button"
              className="cc-pdp__more-btn"
              onClick={() => this.setState((s) => ({ descExpanded: !s.descExpanded }))}
              aria-expanded={expanded ? 'true' : 'false'}
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
              <span className="cc-pdp__more-ico" aria-hidden="true">
                {expanded ? '▴' : '▾'}
              </span>
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  getInitials(name) {
    const raw = String(name || '').trim();
    if (!raw) return 'U';
    const parts = raw.split(/\s+/).filter(Boolean);
    const first = parts[0] ? parts[0][0] : 'U';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  renderReviewComposer(prod) {
    const token = this.context && this.context.token ? this.context.token : '';
    const customer = this.context ? this.context.customer : null;
    const author =
      (customer && (customer.name || customer.username)) ||
      (customer && customer.email) ||
      '';

    if (!token) {
      return (
        <div className="cc-pdp__review-box cc-pdp__review-box--muted">
          <div className="cc-pdp__review-box-title">Gửi đánh giá</div>
          <div className="cc-pdp__review-box-text">
            Bạn cần <Link to="/login">đăng nhập</Link> để gửi đánh giá.
          </div>
        </div>
      );
    }

    return (
      <form
        className="cc-pdp__review-box"
        onSubmit={(e) => {
          e.preventDefault();
          this.submitReview(prod, author);
        }}
      >
        <div className="cc-pdp__review-box-head">
          <div className="cc-pdp__review-box-title">Gửi đánh giá</div>
          <div className="cc-pdp__review-box-note">
            Đánh giá của bạn sẽ hiển thị sau khi được duyệt.
          </div>
        </div>

        <div className="cc-pdp__review-fields">
          <label className="cc-pdp__review-label">
            Số sao
            <div className="cc-pdp__star-picker" role="radiogroup" aria-label="Chọn số sao">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={this.state.reviewStars === n ? 'true' : 'false'}
                  className={
                    'cc-pdp__star-btn' +
                    (this.state.reviewStars >= n ? ' cc-pdp__star-btn--on' : '')
                  }
                  onClick={() => this.setState({ reviewStars: n })}
                  disabled={this.state.reviewSubmitting}
                  title={`${n} sao`}
                >
                  ★
                </button>
              ))}
              <span className="cc-pdp__star-caption">
                {this.state.reviewStars}/5
              </span>
            </div>
          </label>

          <label className="cc-pdp__review-label">
            Nội dung
            <textarea
              className="cc-pdp__review-textarea"
              rows={4}
              value={this.state.reviewContent}
              onChange={(e) => this.setState({ reviewContent: e.target.value })}
              placeholder="Chia sẻ trải nghiệm của bạn…"
              disabled={this.state.reviewSubmitting}
            />
          </label>

          <div className="cc-pdp__review-actions">
            <button
              type="submit"
              className="cc-pdp__review-submit"
              disabled={this.state.reviewSubmitting}
            >
              {this.state.reviewSubmitting ? 'Đang gửi…' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>
      </form>
    );
  }

  renderRelated(prod) {
    const list = this.state.related || [];
    const show = list.length > 0;
    if (this.state.relatedLoading && !show) {
      return (
        <section className="cc-pdp__related" aria-label="Sản phẩm liên quan">
          <div className="cc-pdp__related-head">
            <h2 className="cc-pdp__related-title">Sản phẩm liên quan</h2>
            <p className="cc-pdp__related-sub">Đang tải gợi ý…</p>
          </div>
        </section>
      );
    }
    if (!show) return null;

    return (
      <section className="cc-pdp__related" aria-label="Sản phẩm liên quan">
        <div className="cc-pdp__related-head">
          <h2 className="cc-pdp__related-title">Sản phẩm liên quan</h2>
          <p className="cc-pdp__related-sub">
            Gợi ý thêm sản phẩm cùng danh mục để bạn dễ lựa chọn.
          </p>
        </div>
        <div className="cc-product-list-page__grid">
          {list.map((item) => (
            <ProductCard key={item._id} item={item} showCategoryMeta={false} />
          ))}
        </div>
      </section>
    );
  }

  componentDidMount() {
    this.apiGetProduct(this.props.params.id);
    const spv = this.calcPdpThumbSpvDesktop();
    this.setState({ pdpThumbSpvDesktop: spv });

    this._onResize = () => {
      const next = this.calcPdpThumbSpvDesktop();
      this.setState((s) => (s.pdpThumbSpvDesktop === next ? null : { pdpThumbSpvDesktop: next }));
    };
    try {
      window.addEventListener('resize', this._onResize);
    } catch {
      // ignore
    }
  }

  componentWillUnmount() {
    try {
      if (this._onResize) window.removeEventListener('resize', this._onResize);
    } catch {
      // ignore
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.id !== prevProps.params.id) {
      this.setState({
        product: null,
        status: 'loading',
        txtQuantity: 1,
        related: [],
        relatedLoading: false,
        tab: 'detail',
        reviews: [],
        reviewsLoading: false,
        descExpanded: false,
        pdpSlide: 0,
      });
      this.apiGetProduct(this.props.params.id);
    }
  }

  apiGetProduct(id) {
    if (!id) {
      this.setState({ product: null, status: 'notfound' });
      return;
    }
    axios
      .get('/api/customer/products/' + encodeURIComponent(id))
      .then((res) => {
        const result = res.data;
        if (!result || !result._id) {
          this.setState({ product: null, status: 'notfound' });
          return;
        }
        if (
          result.slug &&
          typeof id === 'string' &&
          /^[a-f0-9]{24}$/i.test(id)
        ) {
          this.props.navigate(productPath(result), { replace: true });
        }
        this.setState({
          product: result,
          status: 'ready',
          txtQuantity: 1,
          related: [],
          relatedLoading: false,
          tab: 'detail',
          reviews: [],
          reviewsLoading: false,
          pdpSlide: 0,
        });
        this.apiGetReviews(result._id);
        this.apiGetRelated(result);
      })
      .catch(() => {
        this.setState({ product: null, status: 'error' });
      });
  }

  apiGetReviews(productId) {
    if (!productId) return;
    this.setState({ reviewsLoading: true });
    axios
      .get('/api/customer/reviews/product/' + productId)
      .then((res) => {
        this.setState({ reviews: res.data || [], reviewsLoading: false });
      })
      .catch(() => this.setState({ reviews: [], reviewsLoading: false }));
  }

  submitReview(prod, author) {
    const token = this.context && this.context.token ? this.context.token : '';
    if (!token) {
      notifyInfo('Vui lòng đăng nhập để gửi đánh giá.');
      return;
    }
    const content = (this.state.reviewContent || '').trim();
    if (content.length < 8) {
      notifyWarning('Nội dung đánh giá tối thiểu 8 ký tự.');
      return;
    }

    const payload = {
      productId: prod._id,
      productName: prod.name,
      author: (author || '').trim(),
      stars: this.state.reviewStars,
      content,
    };
    const config = { headers: { 'x-access-token': token } };
    this.setState({ reviewSubmitting: true });
    axios
      .post('/api/customer/reviews', payload, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (!ok) {
          notifyError((res.data && res.data.message) || 'Gửi đánh giá thất bại.');
          this.setState({ reviewSubmitting: false });
          return;
        }
        notifySuccess('Đã gửi đánh giá. Chờ admin duyệt để hiển thị.');
        this.setState({ reviewSubmitting: false, reviewContent: '', reviewStars: 5 });
        // keep list as active-only; nothing new will appear until approved
      })
      .catch(() => {
        notifyError('Gửi đánh giá thất bại.');
        this.setState({ reviewSubmitting: false });
      });
  }

  apiGetRelated(prod) {
    if (!prod) return;
    const id = prod._id ? String(prod._id) : '';
    const cat = prod.category || {};
    const cid = cat._id ? String(cat._id) : '';
    if (!cid) return;

    this.setState({ relatedLoading: true });
    const catKey = encodeURIComponent(cat.slug || cid);
    axios
      .get('/api/customer/products/category/' + catKey, {
        params: { limit: 12 },
      })
      .then((res) => {
        const list = (res.data || []).filter((p) => String(p._id) !== id).slice(0, 4);
        this.setState({ related: list, relatedLoading: false });
      })
      .catch(() => {
        this.setState({ related: [], relatedLoading: false });
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
