import axios from 'axios';
import React, { Component } from 'react';
import { notifyError, notifySuccess, notifyWarning } from '../utils/notify';
import { Link } from 'react-router-dom';

class Signup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtPassword2: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      isSubmitting: false,
      formError: '',
      showPassword: false,
      showPassword2: false,
      heroBg: null
    };
  }

  componentDidMount() {
    this.apiGetAuthHeroBg();
  }

  apiGetAuthHeroBg() {
    axios
      .get('/api/customer/settings/auth-hero-bg')
      .then((res) => {
        const row = res.data || {};
        if (row && row.mime && row.data) {
          this.setState({ heroBg: { mime: row.mime, data: row.data } });
        } else {
          this.setState({ heroBg: null });
        }
      })
      .catch(() => {
        this.setState({ heroBg: null });
      });
  }

  validate() {
    const username = (this.state.txtUsername || '').trim();
    const password = this.state.txtPassword || '';
    const password2 = this.state.txtPassword2 || '';
    const name = (this.state.txtName || '').trim();
    const phone = (this.state.txtPhone || '').trim();
    const email = (this.state.txtEmail || '').trim();

    if (!username) return 'Vui lòng nhập tên đăng nhập.';
    if (username.length < 3) return 'Tên đăng nhập cần tối thiểu 3 ký tự.';
    if (!password) return 'Vui lòng nhập mật khẩu.';
    if (password.length < 6) return 'Mật khẩu cần tối thiểu 6 ký tự.';
    if (!password2) return 'Vui lòng xác nhận mật khẩu.';
    if (password2 !== password) return 'Mật khẩu xác nhận không khớp.';
    if (!name) return 'Vui lòng nhập họ và tên.';
    if (!phone) return 'Vui lòng nhập số điện thoại.';
    if (!/^[0-9+\-\s()]{8,}$/.test(phone)) return 'Số điện thoại chưa hợp lệ.';
    if (!email) return 'Vui lòng nhập email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email chưa hợp lệ.';
    return '';
  }

  render() {
    const usernameError = this.state.formError && !(this.state.txtUsername || '').trim();
    const passwordError = this.state.formError && !this.state.txtPassword;
    const password2Error = this.state.formError && !this.state.txtPassword2;
    const nameError = this.state.formError && !(this.state.txtName || '').trim();
    const phoneError = this.state.formError && !(this.state.txtPhone || '').trim();
    const emailError = this.state.formError && !(this.state.txtEmail || '').trim();

    const heroBgStyle = this.state.heroBg
      ? {
          backgroundImage: `radial-gradient(1100px 520px at 12% 18%, rgba(15, 23, 42, 0.55), transparent 55%),
            radial-gradient(980px 520px at 86% 12%, rgba(37, 99, 235, 0.35), transparent 54%),
            radial-gradient(880px 520px at 60% 86%, rgba(220, 38, 38, 0.22), transparent 60%),
            linear-gradient(135deg, rgba(11, 15, 20, 0.58) 0%, rgba(10, 18, 32, 0.52) 50%, rgba(11, 15, 20, 0.60) 100%),
            url(data:${this.state.heroBg.mime};base64,${this.state.heroBg.data})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

    return (
      <div className="cc-auth2 align-center cc-home__section">
        <div className="cc-auth2__shell">
          <div className="cc-auth2__grid">
            <section className="cc-auth2__hero" aria-label="Giới thiệu" style={heroBgStyle}>
              <h2 className="cc-auth2__hero-title">Tạo tài khoản nhanh.</h2>
              <p className="cc-auth2__hero-subtitle">
                Lưu thông tin giao hàng, theo dõi trạng thái đơn và nhận ưu đãi thành viên.
              </p>
            </section>

            <section className="cc-auth2__panel" aria-label="Đăng ký">
              <nav className="cc-auth2__toggle" aria-label="Chuyển trang">
                <Link to="/signup" aria-current="page">
                  Đăng ký
                </Link>
                <Link to="/login">Đăng nhập</Link>
              </nav>

              <h1 className="cc-auth2__title">Tạo tài khoản</h1>

              <form className="cc-auth2__form" onSubmit={(e) => this.btnSignupClick(e)}>
                <div className="cc-auth2__row2">
                  <div className="cc-auth2__field">
                    <input
                      className="cc-auth2__input"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Họ và tên"
                      value={this.state.txtName}
                      onChange={(e) => this.setState({ txtName: e.target.value, formError: '' })}
                      aria-invalid={nameError ? 'true' : 'false'}
                    />
                  </div>
                  <div className="cc-auth2__field">
                    <input
                      className="cc-auth2__input"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Số điện thoại"
                      value={this.state.txtPhone}
                      onChange={(e) => this.setState({ txtPhone: e.target.value, formError: '' })}
                      aria-invalid={phoneError ? 'true' : 'false'}
                    />
                  </div>
                </div>

                <div className="cc-auth2__field">
                  <input
                    className="cc-auth2__input"
                    type="text"
                    autoComplete="username"
                    placeholder="Tên đăng nhập"
                    value={this.state.txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value, formError: '' })}
                    aria-invalid={usernameError ? 'true' : 'false'}
                  />
                </div>

                <div className="cc-auth2__field">
                  <input
                    className="cc-auth2__input"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={this.state.txtEmail}
                    onChange={(e) => this.setState({ txtEmail: e.target.value, formError: '' })}
                    aria-invalid={emailError ? 'true' : 'false'}
                  />
                </div>

                <div className="cc-auth2__field">
                  <input
                    className="cc-auth2__input"
                    type={this.state.showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Mật khẩu"
                    value={this.state.txtPassword}
                    onChange={(e) => this.setState({ txtPassword: e.target.value, formError: '' })}
                    aria-invalid={passwordError ? 'true' : 'false'}
                  />
                  <button
                    type="button"
                    className="cc-auth2__suffix-btn"
                    aria-label={this.state.showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => this.setState((s) => ({ showPassword: !s.showPassword }))}
                  >
                    {this.state.showPassword ? '🙈' : '👁'}
                  </button>
                </div>

                <div className="cc-auth2__field">
                  <input
                    className="cc-auth2__input"
                    type={this.state.showPassword2 ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Xác nhận mật khẩu"
                    value={this.state.txtPassword2}
                    onChange={(e) => this.setState({ txtPassword2: e.target.value, formError: '' })}
                    aria-invalid={password2Error ? 'true' : 'false'}
                  />
                  <button
                    type="button"
                    className="cc-auth2__suffix-btn"
                    aria-label={this.state.showPassword2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => this.setState((s) => ({ showPassword2: !s.showPassword2 }))}
                  >
                    {this.state.showPassword2 ? '🙈' : '👁'}
                  </button>
                </div>

                {this.state.formError ? (
                  <div className="cc-auth2__error" role="alert">
                    {this.state.formError}
                  </div>
                ) : null}

                <button className="cc-auth2__cta" type="submit" disabled={this.state.isSubmitting}>
                  {this.state.isSubmitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
                </button>

                <div className="cc-auth2__divider">Or</div>
                <div className="cc-auth2__social" aria-label="Social signup (coming soon)">
                  <button type="button" disabled aria-label="Google">
                    G
                  </button>
                  <button type="button" disabled aria-label="Facebook">
                    f
                  </button>
                  <button type="button" disabled aria-label="Apple">
                    
                  </button>
                </div>

                <p className="cc-auth2__foot">
                  Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    );
  }

  btnSignupClick(e) {

    e.preventDefault();

    if (this.state.isSubmitting) return;

    const msg = this.validate();
    if (msg) {
      this.setState({ formError: msg });
      return;
    }

    const username = (this.state.txtUsername || '').trim();
    const password = this.state.txtPassword;
    const name = (this.state.txtName || '').trim();
    const phone = (this.state.txtPhone || '').trim();
    const email = (this.state.txtEmail || '').trim();

    if (username && password && name && phone && email) {
      const account = { username, password, name, phone, email };
      this.apiSignup(account);
    }
    else {
      notifyWarning('Vui lòng điền đầy đủ thông tin đăng ký.');
    }

  }

  apiSignup(account) {
    this.setState({ isSubmitting: true, formError: '' });
    axios
      .post('/api/customer/signup', account)
      .then((res) => {
        const result = res.data;
        if (result && result.success === true) {
          notifySuccess(result.message || 'Đăng ký thành công.');
          this.setState({
            txtUsername: '',
            txtPassword: '',
            txtPassword2: '',
            txtName: '',
            txtPhone: '',
            txtEmail: ''
          });
        } else {
          const msg = (result && result.message) || 'Đăng ký không thành công.';
          this.setState({ formError: msg });
          notifyError(msg);
        }
      })
      .catch(() => {
        const msg = 'Không thể kết nối máy chủ. Vui lòng thử lại.';
        this.setState({ formError: msg });
        notifyError(msg);
      })
      .finally(() => {
        this.setState({ isSubmitting: false });
      });

  }

}

export default Signup;