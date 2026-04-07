import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class AdminSidebar extends Component {
  render() {
    const { onNavigate, open } = this.props;

    const linkClass = ({ isActive }) =>
      'ad-nav__link' + (isActive ? ' ad-nav__link--active' : '');

    return (
      <aside
        className={'ad-sidebar' + (open ? ' ad-sidebar--open' : '')}
        id="admin-sidebar"
        aria-label="Menu điều hướng"
      >
        <div className="ad-sidebar__section">Menu chính</div>
        <nav className="ad-sidebar__nav">
          <NavLink
            to="/admin/home"
            className={linkClass}
            end
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ▤
            </span>
            Tổng quan
          </NavLink>
          <NavLink
            to="/admin/category"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ☰
            </span>
            Danh mục
          </NavLink>
          <NavLink
            to="/admin/product"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ◫
            </span>
            Sản phẩm
          </NavLink>
          <NavLink
            to="/admin/reviews"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ★
            </span>
            Đánh giá
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ⚙
            </span>
            Giao diện
          </NavLink>
          <NavLink
            to="/admin/slides"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ◧
            </span>
            Slides
          </NavLink>
        </nav>
        <div className="ad-sidebar__section">Bán hàng</div>
        <nav className="ad-sidebar__nav">
          <NavLink
            to="/admin/orders"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ✦
            </span>
            Đơn hàng
          </NavLink>
          <NavLink
            to="/admin/customers"
            className={linkClass}
            onClick={onNavigate}
          >
            <span className="ad-nav__icon" aria-hidden>
              ◉
            </span>
            Khách hàng
          </NavLink>
        </nav>
      </aside>
    );
  }
}

export default AdminSidebar;
