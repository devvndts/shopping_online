import React, { Component } from "react";
import MyContext from "./MyContext";

const LS_TOKEN = "customer.token";
const LS_CUSTOMER = "customer.profile";
const LS_CART = "customer.cart";

function safeGet(key, fallback = "") {
  try {
    const v = window.localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

function safeGetJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeSetJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

class MyProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      token: safeGet(LS_TOKEN, ""),
      customer: safeGetJson(LS_CUSTOMER, null),
      mycart: safeGetJson(LS_CART, []),

      setToken: this.setToken,
      setCustomer: this.setCustomer,
      setMycart: this.setMycart
    };
  }

  setToken = (value) => {
    const v = value || "";
    if (v) safeSet(LS_TOKEN, v);
    else safeRemove(LS_TOKEN);
    this.setState({ token: v });
  };

  setCustomer = (value) => {
    const v = value || null;
    if (v) safeSetJson(LS_CUSTOMER, v);
    else safeRemove(LS_CUSTOMER);
    this.setState({ customer: v });
  };

  setMycart = (value) => {
    const v = Array.isArray(value) ? value : [];
    safeSetJson(LS_CART, v);
    this.setState({ mycart: v });
  }
  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
