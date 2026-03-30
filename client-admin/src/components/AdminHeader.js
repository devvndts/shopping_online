import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class AdminHeader extends Component {
  avatarLetter(name) {
    if (!name || !String(name).trim()) return '?';
    return String(name).trim().charAt(0).toUpperCase();
  }

  render() {
    const { username, onLogout, onMenuToggle } = this.props;

    return (
      <header className="ad-header">
        <div className="ad-header__left">
          <button
            type="button"
            className="ad-header__menu-btn"
            aria-label="Mở menu"
            onClick={onMenuToggle}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/admin/home" className="ad-header__brand">
            <span className="ad-header__logo">S</span>
            <div className="ad-header__titles">
              <p className="ad-header__title">ShopAdmin</p>
              <p className="ad-header__sub">Bảng quản trị</p>
            </div>
          </Link>
        </div>
        <div className="ad-header__right">
          <div className="ad-header__user">
            <span className="ad-header__avatar">
              {this.avatarLetter(username)}
            </span>
            <div className="ad-header__user-info">
              <span className="ad-header__user-label">Đăng nhập</span>
              <span className="ad-header__user-name">{username || '—'}</span>
            </div>
          </div>
          <button
            type="button"
            className="ad-header__logout"
            onClick={onLogout}
          >
            Đăng xuất
          </button>
        </div>
      </header>
    );
  }
}

export default AdminHeader;
