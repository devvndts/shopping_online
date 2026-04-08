import axios from "axios";
import React, { Component } from "react";
import { notifyError, notifySuccess, notifyWarning } from "../utils/notify";

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtToken: "",
      isSubmitting: false,
    };
  }

  componentDidMount() {
    try {
      const qs = typeof window !== "undefined" ? window.location.search : "";
      const sp = new URLSearchParams(qs || "");
      const id = (sp.get("id") || "").trim();
      const token = (sp.get("token") || "").trim();
      if (id && token) {
        this.setState({ txtID: id, txtToken: token }, () => {
          this.apiActive(id, token);
        });
      }
    } catch {
      // ignore
    }
  }

  render() {
    return (
      <div className="cc-auth align-center cc-home__section">
        <div className="cc-section-shell cc-auth__shell">
          <header className="cc-auth__head">
            <h1 className="cc-auth__title">Kích hoạt tài khoản</h1>
            <p className="cc-auth__subtitle">
              Nếu bạn bấm từ email, hệ thống sẽ tự kích hoạt. Hoặc bạn có thể
              nhập ID và token để hoàn tất đăng ký.
            </p>
          </header>

          <form className="cc-auth__form" onSubmit={(e) => this.btnActiveClick(e)}>
            <div className="cc-auth__grid">
              <div className="cc-auth__field cc-auth__field--full">
                <label className="cc-auth__label" htmlFor="cc-active-id">
                  ID
                </label>
                <input
                  id="cc-active-id"
                  className="cc-auth__input"
                  type="text"
                  placeholder="Dán ID của bạn"
                  value={this.state.txtID}
                  onChange={(e) => {
                    this.setState({ txtID: e.target.value });
                  }}
                />
              </div>

              <div className="cc-auth__field cc-auth__field--full">
                <label className="cc-auth__label" htmlFor="cc-active-token">
                  Token
                </label>
                <input
                  id="cc-active-token"
                  className="cc-auth__input"
                  type="text"
                  placeholder="Dán token kích hoạt"
                  value={this.state.txtToken}
                  onChange={(e) => {
                    this.setState({ txtToken: e.target.value });
                  }}
                />
              </div>
            </div>

            <button className="cc-auth__submit" type="submit" disabled={this.state.isSubmitting}>
              {this.state.isSubmitting ? "Đang kích hoạt…" : "Kích hoạt"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  btnActiveClick(e) {
    e.preventDefault();

    if (this.state.isSubmitting) return;

    const id = this.state.txtID;
    const token = this.state.txtToken;

    if (id && token) {
      this.apiActive(id, token);
    } else {
      notifyWarning("Vui lòng nhập ID và token.");
    }
  }

  apiActive(id, token) {
    this.setState({ isSubmitting: true });
    const body = { id: id, token: token };

    axios
      .post("/api/customer/active", body)
      .then((res) => {
        const result = res.data;
        if (result) {
          notifySuccess("Kích hoạt tài khoản thành công.");
        } else {
          notifyError("Kích hoạt thất bại. Kiểm tra lại ID và token.");
        }
      })
      .catch(() => {
        notifyError("Không thể kết nối máy chủ. Vui lòng thử lại.");
      })
      .finally(() => {
        this.setState({ isSubmitting: false });
      });
  }
}

export default Active;
