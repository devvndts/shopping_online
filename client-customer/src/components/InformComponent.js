import React, { Component } from "react";
import { Link } from "react-router-dom";
import MyContext from "../contexts/MyContext";
class Inform extends Component {
  static contextType = MyContext;
  render() {
    return (
      <div className="headerAccount">
        <div className="headerAccount__Left">
          {this.context.token === "" ? (
            <div className="login__link">
              <Link to="/login"><svg xmlns="http://www.w3.org/2000/svg" width={16} height={20} viewBox="0 0 16 20" fill="none">
                                <path d="M14.0097 5.68082C14.0399 8.78676 11.3197 11.3862 7.99754 11.4244C4.7578 11.4626 1.94677 8.80587 1.94845 5.7063C1.95013 2.63859 4.65524 0.0566746 7.92693 0.000926982C11.1835 -0.0564135 13.9794 2.55417 14.0097 5.68082ZM7.97401 9.54811C10.2101 9.54493 12.0308 7.8263 12.0308 5.72064C12.0308 3.60382 10.2235 1.8852 7.99754 1.88201C5.7615 1.87883 3.93399 3.60063 3.93736 5.70789C3.93736 7.83427 5.74469 9.5513 7.97401 9.54811Z" fill="#333333"></path>
                                <path d="M15.9986 20C15.3395 20 14.7343 20 14.1374 20C13.3556 16.2076 11.0658 14.172 7.72687 14.3121C4.90407 14.43 2.13843 16.4353 1.8812 19.9793C1.25914 19.9793 0.633724 19.9793 0.00830321 19.9793C-0.178314 16.6137 2.79243 12.6158 7.74368 12.4295C12.1889 12.2622 16.086 15.8317 15.9986 20Z" fill="#333333"></path>
                            </svg>Đăng nhập</Link> |<Link to="/signup">Đăng ký</Link>{" "}
   
            </div>
          ) : (
            <div>
              Hello <b>{this.context.customer.name}</b> |
              <Link to="/home" onClick={() => this.lnkLogoutClick()}>
                Logout
              </Link>{" "}
              |<Link to="/myprofile">My profile</Link>|
              <Link to='/myorders'> My orders </Link>
            </div>
          )}
        </div>
        <div className="headerAccount__right">
          <Link to='/mycart'> <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M6.50488 2H17.5049C17.8196 2 18.116 2.14819 18.3049 2.4L21.0049 6V21C21.0049 21.5523 20.5572 22 20.0049 22H4.00488C3.4526 22 3.00488 21.5523 3.00488 21V6L5.70488 2.4C5.89374 2.14819 6.19013 2 6.50488 2ZM19.0049 8H5.00488V20H19.0049V8ZM18.5049 6L17.0049 4H7.00488L5.50488 6H18.5049ZM9.00488 10V12C9.00488 13.6569 10.348 15 12.0049 15C13.6617 15 15.0049 13.6569 15.0049 12V10H17.0049V12C17.0049 14.7614 14.7663 17 12.0049 17C9.24346 17 7.00488 14.7614 7.00488 12V10H9.00488Z"></path></svg></Link>  <sup>{this.context.mycart.length}</sup>
        </div>
      </div>
    );
  }
  lnkLogoutClick() {
    this.context.setToken("");
    this.context.setCustomer(null);
    this.context.setMycart([]);
  }
}

export default Inform;


