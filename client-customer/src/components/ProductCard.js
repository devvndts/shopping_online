import React from 'react';
import { Link } from 'react-router-dom';
import { formatVnd } from '../utils/formatVnd';

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
      <Link to={'/product/' + item._id} className="cc-product-card__img-wrap">
        <img
          className="cc-product-card__img"
          src={'data:image/jpg;base64,' + item.image}
          alt={item.name}
        />
      </Link>
      <div className="cc-product-card__body">
        <h3 className="cc-product-card__name">{item.name}</h3>
        {showCategoryMeta && catName ? (
          <p className="cc-product-card__meta">{catName}</p>
        ) : null}
        <p className="cc-product-card__price">{formatVnd(item.price)}</p>
        <Link to={'/product/' + item._id} className="cc-product-card__btn">
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;
