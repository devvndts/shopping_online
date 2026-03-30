import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import '../styles/admin-login.css';

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      showPassword: false,
      formError: '',
      isSubmitting: false,
    };
  }

  render() {
    if (this.context.token !== '') {
      return null;
    }

    const { formError, isSubmitting, showPassword } = this.state;

    return (
      <div className="ca-admin-login">
        <div className="ca-admin-login__panel">
          <aside className="ca-admin-login__hero" aria-hidden="false">
            <span className="ca-admin-login__brand">ShopAdmin</span>
            <h1 className="ca-admin-login__hero-title">
              Bảng điều khiển bán hàng
            </h1>
            <p className="ca-admin-login__hero-text">
              Đăng nhập để quản lý danh mục, sản phẩm và vận hành cửa hàng trực
              tuyến một cách an toàn.
            </p>
           
          </aside>

          <div className="ca-admin-login__card">
            <header className="ca-admin-login__card-head">
              <h2 className="ca-admin-login__card-title">Đăng nhập</h2>
              <p className="ca-admin-login__card-sub">
                Nhập tài khoản quản trị được cấp bởi hệ thống.
              </p>
            </header>

            {formError ? (
              <div className="ca-admin-login__error" role="alert">
                {formError}
              </div>
            ) : null}

            <form
              className="ca-admin-login__form"
              onSubmit={(e) => this.btnLoginClick(e)}
              noValidate
            >
              <div className="ca-admin-login__field">
                <label className="ca-admin-login__label" htmlFor="ca-admin-user">
                  Tên đăng nhập
                </label>
                <input
                  id="ca-admin-user"
                  name="username"
                  className="ca-admin-login__input"
                  type="text"
                  autoComplete="username"
                  placeholder="admin"
                  value={this.state.txtUsername}
                  onChange={(e) =>
                    this.setState({
                      txtUsername: e.target.value,
                      formError: '',
                    })
                  }
                />
              </div>

              <div className="ca-admin-login__field">
                <label className="ca-admin-login__label" htmlFor="ca-admin-pass">
                  Mật khẩu
                </label>
                <div className="ca-admin-login__password-wrap">
                  <input
                    id="ca-admin-pass"
                    name="password"
                    className="ca-admin-login__input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={this.state.txtPassword}
                    onChange={(e) =>
                      this.setState({
                        txtPassword: e.target.value,
                        formError: '',
                      })
                    }
                  />
                  <button
                    type="button"
                    className="ca-admin-login__toggle-pw"
                    onClick={() =>
                      this.setState((s) => ({ showPassword: !s.showPassword }))
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="ca-admin-login__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý…' : 'Đăng nhập'}
              </button>
            </form>

          
          </div>
        </div>
      </div>
    );
  }

  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername.trim();
    const password = this.state.txtPassword;

    if (!username || !password) {
      this.setState({
        formError: 'Vui lòng nhập đủ tên đăng nhập và mật khẩu.',
      });
      return;
    }

    this.setState({ formError: '', isSubmitting: true });
    const account = { username, password };

    axios
      .post('/api/admin/login', account)
      .then((res) => {
        const result = res.data;
        if (result.success === true) {
          this.context.setToken(result.token);
          this.context.setUsername(account.username);
          if (typeof this.props.onSuccess === 'function') {
            this.props.onSuccess();
          }
        } else {
          this.setState({
            formError:
              result.message ||
              'Đăng nhập thất bại. Kiểm tra lại tài khoản hoặc mật khẩu.',
            isSubmitting: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          formError:
            'Không kết nối được máy chủ. Kiểm tra API hoặc mạng rồi thử lại.',
          isSubmitting: false,
        });
      });
  }
}

export default Login;
