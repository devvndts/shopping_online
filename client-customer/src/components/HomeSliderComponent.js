import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function isExternalHref(href) {
  return /^https?:\/\//i.test(String(href || ''));
}

export default function HomeSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/customer/slides')
      .then((res) => setSlides(res.data || []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  const hasSlides = slides && slides.length > 0;

  const swiperModules = useMemo(
    () => [Autoplay, Navigation, Pagination],
    []
  );

  if (loading) {
    return (
      <section className="cc-home-slider" aria-label="Khuyến mãi & nổi bật">
        <div className="cc-home-slider__inner">
          <div className="cc-home-slider__skeleton" aria-hidden="true" />
        </div>
      </section>
    );
  }

  if (!hasSlides) return null;

  const slideImgSrc = (s) => {
    if (!s || !s._id) return '';
    const u = (s.imageUrl || '').trim();
    if (/^https?:\/\//i.test(u)) {
      const sep = u.includes('?') ? '&' : '?';
      return `${u}${sep}v=${s.updatedAt || 0}`;
    }
    if (s.hasLegacyImage) {
      return `/api/customer/slides/${s._id}/image?v=${s.updatedAt || 0}`;
    }
    return '';
  };

  const first = slides[0];
  const firstImg = slideImgSrc(first);

  return (
    <section className="cc-home-slider" aria-label="Khuyến mãi & nổi bật">
      <div className="cc-home-slider__inner">
        {firstImg ? (
          <link rel="preload" as="image" href={firstImg} />
        ) : null}
        <Swiper
          className="cc-home-slider__swiper"
          modules={swiperModules}
          slidesPerView={1}
          spaceBetween={0}
          loop={slides.length > 1}
          autoplay={
            slides.length > 1
              ? { delay: 4500, disableOnInteraction: false }
              : false
          }
          navigation={slides.length > 1}
          pagination={{ clickable: true }}
        >
          {slides.map((s, idx) => {
            const imgSrc = slideImgSrc(s);
            const title = s.title || '';
            const subtitle = s.subtitle || '';
            const href = s.href || '';

            const content = (
              <>
                <img
                  className="cc-home-slider__img"
                  src={imgSrc}
                  alt={title || 'Slide'}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchpriority={idx === 0 ? 'high' : 'auto'}
                />
                <div className="cc-home-slider__overlay" aria-hidden="true" />
                {(title || subtitle) && (
                  <div className="cc-home-slider__content">
                    {title ? <h2 className="cc-home-slider__title">{title}</h2> : null}
                    {subtitle ? (
                      <p className="cc-home-slider__subtitle">{subtitle}</p>
                    ) : null}
                    {href ? (
                      <span className="cc-home-slider__cta">Xem ngay</span>
                    ) : null}
                  </div>
                )}
              </>
            );

            return (
              <SwiperSlide key={s._id}>
                {href ? (
                  isExternalHref(href) ? (
                    <a
                      className="cc-home-slider__slide"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link className="cc-home-slider__slide" to={href}>
                      {content}
                    </Link>
                  )
                ) : (
                  <div className="cc-home-slider__slide">{content}</div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

