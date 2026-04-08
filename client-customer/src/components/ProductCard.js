import React from 'react';
import { Link } from 'react-router-dom';
import { formatVnd } from '../utils/formatVnd';
import { productImageSrc } from '../utils/productImageSrc';
import { productPath } from '../utils/productPath';

function ProductCard({ item, badge, showCategoryMeta }) {
  const catName =
    item.category && item.category.name ? item.category.name : '';
  let badgeClass = '';
  let badgeLabel = '';
  if (badge === 'new') {
    badgeClass = 'cc-product-card__badge cc-product-card__badge--new';
    badgeLabel = 'Mới';
  } else if (badge === 'hot') {
    badgeClass = 'cc-product-card__badge cc-product-card__badge--hot';
    badgeLabel = 'Hot';
  } else if (badge) {
    badgeClass = 'cc-product-card__badge';
    badgeLabel = badge;
  }
  return (
    <div className="cc-product-card">
      {badge ? <span className={badgeClass}>{badgeLabel}</span> : null}
      <Link to={productPath(item)} className="cc-product-card__img-wrap">
        <img
          className="cc-product-card__img"
          src={productImageSrc(item.image)}
          alt={item.name}
        />
      </Link>
      <div className="cc-product-card__body">
        <h3 className="cc-product-card__name">{item.name}</h3>
        {item.brand ? (
          <p className="cc-product-card__brand">{item.brand}</p>
        ) : null}
        {showCategoryMeta && catName ? (
          <p className="cc-product-card__meta">{catName}</p>
        ) : null}
        <p className="cc-product-card__price">{formatVnd(item.price)}</p>
        <Link to={productPath(item)} className="cc-product-card__btn">
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
