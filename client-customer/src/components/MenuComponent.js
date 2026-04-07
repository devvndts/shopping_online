import axios from "axios";
import React, { Component } from "react";

import { Link } from "react-router-dom";
import withRouter from '../utils/withRouter';
import Inform from "./InformComponent";
import { formatVnd } from "../utils/formatVnd";
class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: "",
      suggestOpen: false,
      suggestLoading: false,
      suggestions: [],
      siteLogo: "",
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
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.onDocMouseDown);
    document.removeEventListener("keydown", this.onDocKeyDown);
    if (this.suggestTimer) clearTimeout(this.suggestTimer);
    if (this.abortController) this.abortController.abort();
  }

  render() {
    const cates = this.state.categories.map((item) => {
      return (
        <li key={item._id} className="site-header__cat-item">
          <Link to={"/product/category/" + item._id}>{item.name}</Link>
        </li>
      );
    });

    return (
      <header className="site-header">
        <div className="site-header__top">
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
                <input type="submit" value="Tìm kiếm" />
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
                            src={"data:image/jpg;base64," + p.image}
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

        <nav className="site-header__categories" aria-label="Danh mục sản phẩm">
          <ul className="site-header__cat-list">
            {cates}
          </ul>
        </nav>
      </header>
    );
  }

  apiGetSiteLogo() {
    axios
      .get("/api/customer/settings/site-logo")
      .then((res) => {
        const row = res.data || {};
        if (row && row.mime && row.data) {
          this.setState({ siteLogo: `data:${row.mime};base64,${row.data}` });
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
    if (e.key === "Escape" && this.state.suggestOpen) {
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
    this.props.navigate("/product/" + p._id);
  }
}
export default withRouter(Menu);
