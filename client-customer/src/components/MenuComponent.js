import axios from "axios";
import React, { Component } from "react";

import { Link } from "react-router-dom";
import withRouter from '../utils/withRouter';
import Inform from "./InformComponent";
class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: "",
    };
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
                src="/logo_head.png"
                alt="VLU Laptop Shop"
                width={124}
                height={90}
                className="site-header__logo"
              />
            </Link>
          </div>

          <div className="site-header__search">
            <div className="header__middle--search">
              <form className="search" onSubmit={(e) => this.btnSearchClick(e)}>
                <input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="keyword"
                  value={this.state.txtKeyword}
                  onChange={(e) => {
                    this.setState({ txtKeyword: e.target.value });
                  }}
                />
                <input type="submit" value="Tìm kiếm" />
              </form>
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
  btnSearchClick(e) {
    e.preventDefault();
    const q = (this.state.txtKeyword || "").trim();
    if (q) {
      this.props.navigate("/product/search/" + encodeURIComponent(q));
    } else {
      this.props.navigate("/home");
    }
  }
  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories() {
    axios.get("/api/customer/categories").then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    });
  }
}
export default withRouter(Menu);
