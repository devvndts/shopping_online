import axios from "axios";
import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import withRouter from "../utils/withRouter";
import { notifyError, notifyWarning } from "../utils/notify";
import { Link } from "react-router-dom";

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    this.state = {
      txtUsername: "",
      txtPassword: "",
      isSubmitting: false,
      formError: "",
      showPassword: false,
      heroBg: null,
    };
  }

  componentDidMount() {
    this.apiGetAuthHeroBg();
  }

  apiGetAuthHeroBg() {
    axios
      .get("/api/customer/settings/auth-hero-bg")
      .then((res) => {
        const row = res.data || {};
        const u = (row.imageUrl || "").trim();
        if (u) {
          this.setState({ heroBg: { imageUrl: u } });
        } else {
          this.setState({ heroBg: null });
        }
      })
      .catch(() => {
        this.setState({ heroBg: null });
      });
  }

  validate() {
    const username = (this.state.txtUsername || "").trim();
    const password = this.state.txtPassword || "";
    if (!username) return "Vui lòng nhập tên đăng nhập.";
    if (username.length < 3) return "Tên đăng nhập cần tối thiểu 3 ký tự.";
    if (!password) return "Vui lòng nhập mật khẩu.";
    if (password.length < 3) return "Mật khẩu cần ít nhất 3 ký tự.";
    return "";
  }

  render() {
    const usernameError =
      this.state.formError && !(this.state.txtUsername || "").trim();
    const passwordError = this.state.formError && !this.state.txtPassword;

    const heroBgStyle = this.state.heroBg
      ? {
          backgroundImage: `radial-gradient(1100px 520px at 12% 18%, rgba(15, 23, 42, 0.55), transparent 55%),
            radial-gradient(980px 520px at 86% 12%, rgba(37, 99, 235, 0.35), transparent 54%),
            radial-gradient(880px 520px at 60% 86%, rgba(220, 38, 38, 0.22), transparent 60%),
            linear-gradient(135deg, rgba(11, 15, 20, 0.58) 0%, rgba(10, 18, 32, 0.52) 50%, rgba(11, 15, 20, 0.60) 100%),
            url(${this.state.heroBg.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : undefined;

    return (
      <div className="cc-auth2 align-center cc-home__section">
        <div className="cc-auth2__shell">
          <div className="cc-auth2__grid">
            <section
              className="cc-auth2__hero"
              aria-label="Giới thiệu"
              style={heroBgStyle}
            >
      
              <h2 className="cc-auth2__hero-title">Mua sắm laptop dễ dàng.</h2>
              <p className="cc-auth2__hero-subtitle">
                Đăng nhập để quản lý giỏ hàng, theo dõi đơn và nhận ưu đãi thành viên.
              </p>
            </section>

            <section className="cc-auth2__panel" aria-label="Đăng nhập">
              <nav className="cc-auth2__toggle" aria-label="Chuyển trang">
                <Link to="/signup">Đăng ký</Link>
                <Link to="/login" aria-current="page">
                  Đăng nhập
                </Link>
              </nav>

              <h1 className="cc-auth2__title">Đăng nhập</h1>

              <form className="cc-auth2__form" onSubmit={(e) => this.btnLoginClick(e)}>
                <div className="cc-auth2__field">
                  <input
                    className="cc-auth2__input"
                    type="text"
                    autoComplete="username"
                    placeholder="Username"
                    value={this.state.txtUsername}
                    onChange={(e) =>
                      this.setState({ txtUsername: e.target.value, formError: "" })
                    }
                    aria-invalid={usernameError ? "true" : "false"}
                  />
                </div>

                <div className="cc-auth2__field">
                  <input
                    className="cc-auth2__input"
                    type={this.state.showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={this.state.txtPassword}
                    onChange={(e) =>
                      this.setState({ txtPassword: e.target.value, formError: "" })
                    }
                    aria-invalid={passwordError ? "true" : "false"}
                  />
                  <button
                    type="button"
                    className="cc-auth2__suffix-btn"
                    aria-label={this.state.showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => this.setState((s) => ({ showPassword: !s.showPassword }))}
                  >
                    {this.state.showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                {this.state.formError ? (
                  <div className="cc-auth2__error" role="alert">
                    {this.state.formError}
                  </div>
                ) : null}

                <button className="cc-auth2__cta" type="submit" disabled={this.state.isSubmitting}>
                  {this.state.isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
                </button>

                <div className="cc-auth2__divider">Or</div>
                <div className="cc-auth2__social" aria-label="Social login (coming soon)">
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
                  Chưa có tài khoản? <Link to="/signup">Tạo tài khoản</Link>
                </p>
              </form>
            </section>
          </div>
        </div>
      </div>
    );
  }

  btnLoginClick(e) {
    e.preventDefault();

    if (this.state.isSubmitting) return;

    const msg = this.validate();
    if (msg) {
      this.setState({ formError: msg });
      return;
    }

    const username = (this.state.txtUsername || "").trim();
    const password = this.state.txtPassword;

    if (username && password) {
      const account = { username: username, password: password };

      this.apiLogin(account);
    } else {
      notifyWarning("Vui lòng nhập tên đăng nhập và mật khẩu.");
    }
  }

  apiLogin(account) {
    this.setState({ isSubmitting: true, formError: "" });
    axios
      .post("/api/customer/login", account)
      .then((res) => {
        const result = res.data;

        if (result && result.success === true) {
          this.context.setToken(result.token);
          this.context.setCustomer(result.customer);
          this.props.navigate("/home");
        } else {
          const msg = (result && result.message) || "Đăng nhập thất bại.";
          this.setState({ formError: msg });
          notifyError(msg);
        }
      })
      .catch(() => {
        const msg = "Không thể kết nối máy chủ. Vui lòng thử lại.";
        this.setState({ formError: msg });
        notifyError(msg);
      })
      .finally(() => {
        this.setState({ isSubmitting: false });
      });
  }
}

export default withRouter(Login);
