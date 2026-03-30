import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import Home from "./HomeComponent";
import { Routes, Route, Navigate } from "react-router-dom";
import Category from "./CategoryComponent";
import Product from "./ProductComponent";
import Customer from "./CustomerComponent";
import Order from "./OrderComponent";

class Main extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = { sidebarOpen: false };
  }

  toggleSidebar = () => {
    this.setState((s) => ({ sidebarOpen: !s.sidebarOpen }));
  };

  closeSidebar = () => {
    this.setState({ sidebarOpen: false });
  };

  logout = () => {
    this.context.setToken("");
    this.context.setUsername("");
    this.setState({ sidebarOpen: false });
  };

  render() {
    if (this.context.token === "") {
      return null;
    }

    const { sidebarOpen } = this.state;

    return (
      <div className="ad-app">
        <AdminHeader
          username={this.context.username}
          onLogout={this.logout}
          onMenuToggle={this.toggleSidebar}
        />
        <button
          type="button"
          className={
            "ad-sidebar-backdrop" +
            (sidebarOpen ? " ad-sidebar-backdrop--open" : "")
          }
          onClick={this.closeSidebar}
          aria-label="Đóng menu"
        />
        <div className="ad-body">
          <AdminSidebar open={sidebarOpen} onNavigate={this.closeSidebar} />
          <main className="ad-main">
            <div className="ad-main__inner">
              <Routes>
                <Route
                  path="/admin"
                  element={<Navigate replace to="/admin/home" />}
                />
                <Route path="/admin/home" element={<Home />} />
                <Route path="/admin/category" element={<Category />} />
                <Route path="/admin/product" element={<Product />} />
                <Route path="/admin/customers" element={<Customer />} />
                <Route path="/admin/orders" element={<Order />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;
