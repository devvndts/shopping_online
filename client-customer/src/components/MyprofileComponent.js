import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtUsername: "",
      txtPassword: "",
      txtName: "",
      txtPhone: "",
      txtEmail: "",
    };
  }

  render() {
    if (this.context.token === "") {
      return <Navigate replace to="/login" />;
    }

    return (
      <div className="cc-auth align-center cc-home__section">
        <div className="cc-section-shell cc-auth__shell">
          <header className="cc-auth__head">
            <h1 className="cc-auth__title">Tài khoản</h1>
            <p className="cc-auth__subtitle">
              Cập nhật thông tin liên hệ để thuận tiện giao hàng và hỗ trợ.
            </p>
          </header>

          <form className="cc-auth__form" onSubmit={(e) => this.btnUpdateClick(e)}>
            <div className="cc-auth__grid">
              <div className="cc-auth__field">
                <label className="cc-auth__label" htmlFor="cc-profile-username">
                  Tên đăng nhập
                </label>
                <input
                  id="cc-profile-username"
                  className="cc-auth__input"
                  type="text"
                  autoComplete="username"
                  value={this.state.txtUsername}
                  onChange={(e) => {
                    this.setState({ txtUsername: e.target.value });
                  }}
                />
              </div>

              <div className="cc-auth__field">
                <label className="cc-auth__label" htmlFor="cc-profile-password">
                  Mật khẩu
                </label>
                <input
                  id="cc-profile-password"
                  className="cc-auth__input"
                  type="password"
                  autoComplete="current-password"
                  value={this.state.txtPassword}
                  onChange={(e) => {
                    this.setState({ txtPassword: e.target.value });
                  }}
                />
              </div>

              <div className="cc-auth__field">
                <label className="cc-auth__label" htmlFor="cc-profile-name">
                  Họ và tên
                </label>
                <input
                  id="cc-profile-name"
                  className="cc-auth__input"
                  type="text"
                  autoComplete="name"
                  value={this.state.txtName}
                  onChange={(e) => {
                    this.setState({ txtName: e.target.value });
                  }}
                />
              </div>

              <div className="cc-auth__field">
                <label className="cc-auth__label" htmlFor="cc-profile-phone">
                  Số điện thoại
                </label>
                <input
                  id="cc-profile-phone"
                  className="cc-auth__input"
                  type="tel"
                  autoComplete="tel"
                  value={this.state.txtPhone}
                  onChange={(e) => {
                    this.setState({ txtPhone: e.target.value });
                  }}
                />
              </div>

              <div className="cc-auth__field cc-auth__field--full">
                <label className="cc-auth__label" htmlFor="cc-profile-email">
                  Email
                </label>
                <input
                  id="cc-profile-email"
                  className="cc-auth__input"
                  type="email"
                  autoComplete="email"
                  value={this.state.txtEmail}
                  onChange={(e) => {
                    this.setState({ txtEmail: e.target.value });
                  }}
                />
              </div>
            </div>

            <button className="cc-auth__submit" type="submit">
              Lưu thay đổi
            </button>
          </form>
        </div>
      </div>
    );
  }

  componentDidMount() {
    if (this.context.customer) {
      this.setState({
        txtUsername: this.context.customer.username,
        txtPassword: this.context.customer.password,
        txtName: this.context.customer.name,
        txtPhone: this.context.customer.phone,
        txtEmail: this.context.customer.email,
      });
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();

    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    const name = this.state.txtName;
    const phone = this.state.txtPhone;
    const email = this.state.txtEmail;

    if (username && password && name && phone && email) {
      const customer = {
        username: username,
        password: password,
        name: name,
        phone: phone,
        email: email,
      };

      this.apiPutCustomer(this.context.customer._id, customer);
    } else {
      notifyWarning("Vui lòng điền đầy đủ thông tin.");
    }
  }

  apiPutCustomer(id, customer) {
    const config = {
      headers: { "x-access-token": this.context.token },
    };

    axios.put("/api/customer/customers/" + id, customer, config).then((res) => {
      const result = res.data;

      if (result) {
        notifySuccess("Cập nhật hồ sơ thành công.");
        this.context.setCustomer(result);
      } else {
        notifyError("Cập nhật thất bại. Vui lòng thử lại.");
      }
    });
  }
}

export default Myprofile;

