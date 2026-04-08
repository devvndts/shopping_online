import axios from "axios";
import React, { Component } from "react";

import { Link } from "react-router-dom";
import withRouter from '../utils/withRouter';
import Inform from "./InformComponent";
import { formatVnd } from "../utils/formatVnd";
import { productPath } from "../utils/productPath";
import { categoryPath } from "../utils/categoryPath";
import { productImageSrc } from "../utils/productImageSrc";
import MyContext from "../contexts/MyContext";

class Menu extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: "",
      suggestOpen: false,
      suggestLoading: false,
      suggestions: [],
      siteLogo: "",
      mobileNavOpen: false,
    };
    this.searchRootRef = React.createRef();
    this.suggestTimer = null;
    this.abortController = null;
  }

  componentDidMount() {
    this.apiGetCategories();
    this.apiGetSiteLogo();
    document.addEventListener("mousedown", this.onDocMouseDown);
    document.addEventListener("keydown", this.onDocKeyDown);
    window.addEventListener("resize", this.onWinResize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.mobileNavOpen !== this.state.mobileNavOpen) {
      document.body.style.overflow = this.state.mobileNavOpen ? "hidden" : "";
    }
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.onDocMouseDown);
    document.removeEventListener("keydown", this.onDocKeyDown);
    window.removeEventListener("resize", this.onWinResize);
    document.body.style.overflow = "";
    if (this.suggestTimer) clearTimeout(this.suggestTimer);
    if (this.abortController) this.abortController.abort();
  }

  onWinResize = () => {
    if (typeof window !== "undefined" && window.innerWidth > 1024 && this.state.mobileNavOpen) {
      this.setState({ mobileNavOpen: false });
    }
  };

  closeMobileNav = () => {
    this.setState({ mobileNavOpen: false });
  };

  toggleMobileNav = () => {
    this.setState((s) => ({ mobileNavOpen: !s.mobileNavOpen }));
  };

  render() {
    const cates = this.state.categories.map((item) => {
      return (
        <li key={item._id} className="site-header__cat-item">
          <Link to={categoryPath(item)}>{item.name}</Link>
        </li>
      );
    });

    const mobileCates = this.state.categories.map((item) => {
      return (
        <li key={"m-" + item._id} className="cc-mobile-nav__item">
          <Link
            to={categoryPath(item)}
            className="cc-mobile-nav__link"
            onClick={this.closeMobileNav}
          >
            {item.name}
          </Link>
        </li>
      );
    });

    const { mobileNavOpen } = this.state;

    return (
      <header className="site-header">
        <div className="site-header__top">
          <button
            type="button"
            className="site-header__menu-btn"
            onClick={this.toggleMobileNav}
            aria-label={mobileNavOpen ? "Đóng menu" : "Mở menu danh mục"}
            aria-expanded={mobileNavOpen ? "true" : "false"}
            aria-controls="cc-mobile-nav-panel"
          >
            <span
              className={
                "site-header__menu-icon" +
                (mobileNavOpen ? " site-header__menu-icon--open" : "")
              }
              aria-hidden="true"
            >
              <span />
            </span>
          </button>

          <div className="site-header__brand">
            <Link to="/home">
              <img
                src={this.state.siteLogo || "/logo_head.png"}
                alt="VLU Laptop Shop"
                width={124}
                height={90}
                className="site-header__logo"
              />
            </Link>
          </div>

          <div className="site-header__search">
            <div className="header__middle--search cc-search" ref={this.searchRootRef}>
              <form className="search" onSubmit={(e) => this.btnSearchClick(e)}>
                <input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="keyword"
                  value={this.state.txtKeyword}
                  onChange={(e) => {
                    this.onKeywordChange(e.target.value);
                  }}
                  onFocus={() => {
                    if (this.state.suggestions.length > 0) {
                      this.setState({ suggestOpen: true });
                    }
                  }}
                />
                <input
                  type="submit"
                  className="cc-search__submit"
                  value="Tìm kiếm"
                  aria-label="Tìm kiếm"
                />
              </form>
              {this.state.suggestOpen ? (
                <div
                  className="cc-search__dropdown"
                  role="listbox"
                  aria-label="Gợi ý sản phẩm"
                >
                  {this.state.suggestLoading ? (
                    <div className="cc-search__row cc-search__row--muted">
                      Đang tìm…
                    </div>
                  ) : null}

                  {!this.state.suggestLoading && this.state.suggestions.length === 0 ? (
                    <div className="cc-search__row cc-search__row--muted">
                      Không có gợi ý.
                    </div>
                  ) : null}

                  {this.state.suggestions.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className="cc-search__row"
                      role="option"
                      aria-selected="false"
                      onClick={() => this.onPickSuggestion(p)}
                    >
                      <span className="cc-search__thumb">
                        {p.image ? (
                          <img
                            src={productImageSrc(p.image)}
                            alt=""
                            loading="lazy"
                          />
                        ) : null}
                      </span>
                      <span className="cc-search__meta">
                        <span className="cc-search__name">{p.name}</span>
                        <span className="cc-search__price">
                          {formatVnd(p.price)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="site-header__actions">
            <Inform />
          </div>
        </div>

        <nav
          className="site-header__categories site-header__categories--desktop"
          aria-label="Danh mục sản phẩm"
        >
          <ul className="site-header__cat-list">{cates}</ul>
        </nav>

        {mobileNavOpen ? (
          <div
            className="cc-mobile-nav"
            id="cc-mobile-nav-root"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cc-mobile-nav-title"
          >
            <button
              type="button"
              className="cc-mobile-nav__backdrop"
              aria-label="Đóng menu"
              onClick={this.closeMobileNav}
            />
            <div
              className="cc-mobile-nav__panel"
              id="cc-mobile-nav-panel"
            >
              <div className="cc-mobile-nav__head">
                <h2 id="cc-mobile-nav-title" className="cc-mobile-nav__title">
                  Danh mục
                </h2>
                <button
                  type="button"
                  className="cc-mobile-nav__close"
                  onClick={this.closeMobileNav}
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
              <nav className="cc-mobile-nav__body" aria-label="Danh mục sản phẩm">
                <ul className="cc-mobile-nav__list">{mobileCates}</ul>
              </nav>
              <div className="cc-mobile-nav__quick">
                <Link
                  to="/home"
                  className="cc-mobile-nav__quick-link"
                  onClick={this.closeMobileNav}
                >
                  Trang chủ
                </Link>
                <Link
                  to="/mycart"
                  className="cc-mobile-nav__quick-link"
                  onClick={this.closeMobileNav}
                >
                  Giỏ hàng
                </Link>
                {this.context.token === "" ? (
                  <Link
                    to="/login"
                    className="cc-mobile-nav__quick-link"
                    onClick={this.closeMobileNav}
                  >
                    Đăng nhập
                  </Link>
                ) : (
                  <Link
                    to="/myorders"
                    className="cc-mobile-nav__quick-link"
                    onClick={this.closeMobileNav}
                  >
                    Đơn hàng
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  apiGetSiteLogo() {
    axios
      .get("/api/customer/settings/site-logo")
      .then((res) => {
        const row = res.data || {};
        const u = (row.imageUrl || "").trim();
        if (u) {
          this.setState({ siteLogo: u });
        } else {
          this.setState({ siteLogo: "" });
        }
      })
      .catch(() => this.setState({ siteLogo: "" }));
  }
  btnSearchClick(e) {
    e.preventDefault();
    const q = (this.state.txtKeyword || "").trim();
    if (q) {
      this.props.navigate("/product/search/" + encodeURIComponent(q));
    } else {
      this.props.navigate("/home");
    }
  }

  onDocMouseDown = (e) => {
    if (!this.state.suggestOpen) return;
    const root = this.searchRootRef.current;
    if (root && !root.contains(e.target)) {
      this.setState({ suggestOpen: false });
    }
  };

  onDocKeyDown = (e) => {
    if (e.key !== "Escape") return;
    if (this.state.mobileNavOpen) {
      this.setState({ mobileNavOpen: false });
      return;
    }
    if (this.state.suggestOpen) {
      this.setState({ suggestOpen: false });
    }
  };

  apiGetCategories() {
    axios.get("/api/customer/categories").then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    });
  }

  onKeywordChange(value) {
    const v = value;
    this.setState({ txtKeyword: v, suggestOpen: true });

    if (this.suggestTimer) clearTimeout(this.suggestTimer);

    const q = (v || "").trim();
    if (q.length < 2) {
      if (this.abortController) this.abortController.abort();
      this.setState({ suggestions: [], suggestLoading: false, suggestOpen: false });
      return;
    }

    this.suggestTimer = setTimeout(() => {
      this.apiSuggest(q);
    }, 300);
  }

  apiSuggest(q) {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();
    this.setState({ suggestLoading: true });
    axios
      .get("/api/customer/products/search/" + encodeURIComponent(q), {
        signal: this.abortController.signal,
      })
      .then((res) => {
        const list = (res.data || []).slice(0, 8);
        this.setState({ suggestions: list, suggestLoading: false, suggestOpen: true });
      })
      .catch((err) => {
        // Ignore abort
        if (err && (err.name === "CanceledError" || err.code === "ERR_CANCELED")) {
          return;
        }
        this.setState({ suggestions: [], suggestLoading: false, suggestOpen: false });
      });
  }

  onPickSuggestion(p) {
    if (!p || !p._id) return;
    this.setState({ suggestOpen: false });
    this.props.navigate(productPath(p));
  }
}
export default withRouter(Menu);
