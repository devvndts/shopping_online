import React, { Component } from "react";
import Menu from "./MenuComponent";

import Home from "./HomeComponent";
import { Routes, Route, Navigate } from "react-router-dom";
import Product from "./ProductComponent";
import ProductDetail from "./ProductDetailComponent";
import Signup from "./SignupComponent";
import Active from "./ActiveComponent";
import Login from "./LoginComponent";
import Myprofile from './MyprofileComponent';
import Mycart from './MycartComponent';
import Myorders from './MyordersComponent';
import HeaderTop from "./HeaderTopComponent";
import Footer from "./FooterComponent";
class Main extends Component {
  render() {
    return (
      <>
        <HeaderTop />
        <div className="body-customer cc-layout">
          <Menu />
          <main className="site-main">
            <Routes>
              <Route path="/" element={<Navigate replace to="/home" />} />
              <Route path="/home" element={<Home />} />
              <Route path="/product/category/:cid" element={<Product />} />
              <Route path="/product/search/:keyword" element={<Product />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/active" element={<Active />} />
              <Route path="/login" element={<Login />} />
              <Route path='/myprofile' element={<Myprofile />} />
              <Route path='/mycart' element={<Mycart />} />
              <Route path='/myorders' element={<Myorders />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </>
    );
  }
}

export default Main;
