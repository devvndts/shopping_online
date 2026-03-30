import React, { Component } from "react";
import { notifySuccess, notifyWarning } from "../utils/notify";

function IconPin(props) {
  return (
    <svg
      className="site-footer__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconPhone(props) {
  return (
    <svg
      className="site-footer__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V21c0 .55-.45 1-1 1C10.07 22 2 13.93 2 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMail(props) {
  return (
    <svg
      className="site-footer__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconClock(props) {
  return (
    <svg
      className="site-footer__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
        fill="currentColor"
      />
    </svg>
  );
}

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = { newsletterEmail: "" };
  }

  newsletterSubmit = (e) => {
    e.preventDefault();
    const email = (this.state.newsletterEmail || "").trim();
    if (email) {
      notifySuccess("Cảm ơn bạn! Chúng tôi sẽ gửi tin khuyến mãi tới " + email);
      this.setState({ newsletterEmail: "" });
    } else {
      notifyWarning("Vui lòng nhập địa chỉ email.");
    }
  };

  render() {
    return (
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__intro">
            <h2 className="site-footer__title">
              Giới thiệu về VLU Laptop Shop
            </h2>
            <ul className="site-footer__list">
              <li>
                <div className="site-footer__contact-row">
                  <IconPin />
                  <span>
                    69/89 Đặng Thùy Trâm, Phường Bình Lợi Trung, TP. HCM
                  </span>
                </div>
              </li>
              <li>
                <div className="site-footer__contact-row">
                  <IconPhone />
                  <a href="tel:0987654321">0987654321</a>
                </div>
              </li>
              <li>
                <div className="site-footer__contact-row">
                  <IconMail />
                  <a href="mailto:support@test.com">support@test.com</a>
                </div>
              </li>
              <li>
                <div className="site-footer__contact-row">
                  <IconClock />
                  <div>
                    <div>Thời gian làm việc:</div>
                    <div className="site-footer__hours">
                      - Thứ Hai đến Thứ Bảy: 9h - 21h
                    </div>
                    <div className="site-footer__hours">
                      - Chủ nhật &amp; Ngày lễ: 9h - 20h
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <nav className="site-footer__links" aria-label="Dịch vụ">
            <h2 className="site-footer__title">Dịch vụ và thông tin khác</h2>
            <ul className="site-footer__list">
              <li>
                <button type="button" className="site-footer__link-btn">
                  Hướng dẫn mua hàng online
                </button>
              </li>
              <li>
                <button type="button" className="site-footer__link-btn">
                  Quy định đổi - trả hàng
                </button>
              </li>
              <li>
                <button type="button" className="site-footer__link-btn">
                  Trả góp 0% lãi suất
                </button>
              </li>
              <li>
                <button type="button" className="site-footer__link-btn">
                  Hình thức giao hàng
                </button>
              </li>
              <li>
                <button type="button" className="site-footer__link-btn">
                  Phương thức thanh toán
                </button>
              </li>
              <li>
                <button type="button" className="site-footer__link-btn">
                  Bán hàng cho doanh nghiệp
                </button>
              </li>
            </ul>
          </nav>

          <div className="site-footer__newsletter">
            <h2 className="site-footer__title">Đăng ký nhận tin khuyến mãi</h2>
            <p className="site-footer__newsletter-desc">
              Đăng ký để nhận được những thông tin về sản phẩm mới và khuyến
              mãi.
            </p>
            <form
              className="site-footer__form"
              onSubmit={this.newsletterSubmit}
            >
              <div className="site-footer__input-wrap">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Địa chỉ Email"
                  value={this.state.newsletterEmail}
                  onChange={(e) =>
                    this.setState({ newsletterEmail: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="site-footer__submit"
                  aria-label="Đăng ký nhận tin"
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </form>
            <div className="site-footer__social">
              <a
                className="site-footer__social-link"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2v-2.5C10 8.57 11.57 7 13.5 7H16v3h-1.5c-.83 0-1 .33-1 1V12h3l-.5 3H14v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>
              <a
                className="site-footer__social-link"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 004 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                className="site-footer__social-link"
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                className="site-footer__social-link"
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a
                className="site-footer__social-link"
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer__bar">
          <p className="site-footer__copyright">
            © {new Date().getFullYear()} VLU Laptop Shop. Bảo lưu mọi quyền.
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
