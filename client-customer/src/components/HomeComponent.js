import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import { categoryPath } from '../utils/categoryPath';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HOME_SWIPER_BREAKPOINTS = {
  520: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
  1280: { slidesPerView: 4.2, spaceBetween: 22 }
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newprods: [],
      hotprods: [],
      categorySections: []
    };
  }

  render() {
    return (
      <div className="cc-home">
        <Reveal
          as="div"
          className="align-center cc-home__section cc-home__section--new"
          index={0}
          style={{ '--cc-reveal-delay-step': '60ms' }}
        >
          <div className="cc-section-shell">
            <div className="cc-new-products">
              <div className="cc-new-products__head">
                <h2 className="text-center cc-section-heading">
                  Sản phẩm mới
                </h2>
                <p className="text-center cc-section-subtitle">
                  Laptop mới nhất, cập nhật thường xuyên. Trượt hoặc dùng nút
                  hai bên để xem thêm.
                </p>
              </div>
              {this.state.newprods.length > 0 ? (
                <Swiper
                  className="cc-new-products__swiper"
                  modules={[Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1.15}
                  watchOverflow={true}
                  navigation={true}
                
                  breakpoints={HOME_SWIPER_BREAKPOINTS}
                >
                  {this.state.newprods.map((item, idx) => (
                    <SwiperSlide key={item._id}>
                      <ProductCard
                        item={item}
                        badge="new"
                        showCategoryMeta={true}
                        animIndex={idx}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : null}
            </div>
          </div>
        </Reveal>

        {this.state.categorySections.length > 0 ? (
          <Reveal
            as="div"
            className="align-center cc-home__section cc-home__section--category"
            index={1}
            style={{ '--cc-reveal-delay-step': '60ms' }}
          >
            <div className="cc-section-shell">
              <h2 className="text-center cc-section-heading cc-category-sections__main-title">
                Sản phẩm theo danh mục
              </h2>
              <p className="text-center cc-section-subtitle">
                Chọn nhanh dòng máy phù hợp nhu cầu — gaming, văn phòng hay
                mỏng nhẹ.
              </p>
              {this.state.categorySections.map((block, bi) => (
                <Reveal
                  as="section"
                  key={block.category._id}
                  className="cc-category-block"
                  index={bi}
                  style={{ '--cc-reveal-delay-step': '80ms' }}
                >
                  <div className="cc-category-block__head">
                    <h3 className="cc-category-block__title">
                      {String(block.category.name || '').toUpperCase()}
                    </h3>
                    <Link
                      to={categoryPath(block.category)}
                      className="cc-category-block__link"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                  <div className="cc-category-grid">
                    {block.products.slice(0, 8).map((item, idx) => (
                      <ProductCard
                        key={item._id}
                        item={item}
                        showCategoryMeta={false}
                        animIndex={idx}
                      />
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        ) : null}

        {this.state.hotprods.length > 0 ? (
          <Reveal
            as="div"
            className="align-center cc-home__section cc-home__section--hot"
            index={2}
            style={{ '--cc-reveal-delay-step': '60ms' }}
          >
            <div className="cc-section-shell cc-section-shell--dark">
              <div className="cc-hot-section__head">
                <h2 className="text-center cc-section-heading cc-section-heading--on-dark">
                  Sản phẩm bán chạy
                </h2>
                <p className="text-center cc-section-subtitle cc-section-subtitle--on-dark">
                  Được khách hàng tin chọn — chất lượng đã qua kiểm chứng.
                </p>
              </div>
              <Swiper
                className="cc-hot-swiper"
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1.15}
                watchOverflow={true}
                navigation={true}
                pagination={{ clickable: true }}
                breakpoints={HOME_SWIPER_BREAKPOINTS}
              >
                {this.state.hotprods.map((item, idx) => (
                  <SwiperSlide key={item._id}>
                    <ProductCard
                      item={item}
                      badge="hot"
                      showCategoryMeta={true}
                      animIndex={idx}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </Reveal>
        ) : (
          <div />
        )}
      </div>
    );
  }

  componentDidMount() {
    this.apiGetNewProducts();
    this.apiGetHotProducts();
    this.apiGetCategorySections();
  }

  apiGetNewProducts() {
    axios
      .get('/api/customer/products/new', { params: { limit: 8 } })
      .then((res) => {
        const result = res.data;
        this.setState({ newprods: result });
      });
  }

  apiGetHotProducts() {
    axios.get('/api/customer/products/hot').then((res) => {
      const result = res.data;
      this.setState({ hotprods: result });
    });
  }

  apiGetCategorySections() {
    axios.get('/api/customer/categories').then((res) => {
      const cats = res.data;
      if (!cats.length) {
        this.setState({ categorySections: [] });
        return;
      }
      Promise.all(
        cats.map((c) =>
          axios
            .get(
              '/api/customer/products/category/' +
                encodeURIComponent(c.slug || c._id),
              {
                params: { limit: 8 },
              }
            )
            .then((r) => ({ category: c, products: r.data || [] }))
        )
      ).then((blocks) => {
        this.setState({
          categorySections: blocks.filter((b) => b.products.length > 0)
        });
      });
    });
  }
}

export default Home;
