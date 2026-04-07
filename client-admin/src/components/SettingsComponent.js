import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { notifyError, notifySuccess, notifyWarning } from '../utils/notify';

function stripBase64DataUrl(raw) {
  if (!raw) return '';
  return String(raw).replace(/^data:([^;]+);base64,/i, '');
}

function extractMime(raw) {
  if (!raw) return '';
  const m = String(raw).match(/^data:([^;]+);base64,/i);
  return m ? m[1] : '';
}

class Settings extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      saving: false,
      bgPreview: '',
      logoPreview: '',
      notice: null,
      updatedAt: 0,
      logoUpdatedAt: 0,
    };
  }

  componentDidMount() {
    this.apiGetAuthHeroBg();
    this.apiGetSiteLogo();
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  previewBg = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      this.setNotice('error', 'Vui lòng chọn file ảnh.');
      notifyWarning('Vui lòng chọn file ảnh.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      this.setState({ bgPreview: evt.target.result, notice: null });
    };
    reader.readAsDataURL(file);
  };

  apiGetAuthHeroBg() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/settings/auth-hero-bg', config)
      .then((res) => {
        const row = res.data || {};
        if (row && row.mime && row.data) {
          this.setState({
            bgPreview: `data:${row.mime};base64,${row.data}`,
            updatedAt: row.updatedAt || 0,
            loading: false,
          });
        } else {
          this.setState({ bgPreview: '', updatedAt: 0, loading: false });
        }
      })
      .catch(() => {
        this.setState({ bgPreview: '', updatedAt: 0, loading: false });
        this.setNotice('error', 'Không thể tải cấu hình giao diện.');
      });
  }

  previewLogo = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      this.setNotice('error', 'Vui lòng chọn file ảnh.');
      notifyWarning('Vui lòng chọn file ảnh.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      this.setState({ logoPreview: evt.target.result, notice: null });
    };
    reader.readAsDataURL(file);
  };

  apiGetSiteLogo() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/settings/site-logo', config)
      .then((res) => {
        const row = res.data || {};
        if (row && row.mime && row.data) {
          this.setState({
            logoPreview: `data:${row.mime};base64,${row.data}`,
            logoUpdatedAt: row.updatedAt || 0,
          });
        } else {
          this.setState({ logoPreview: '', logoUpdatedAt: 0 });
        }
      })
      .catch(() => {
        this.setState({ logoPreview: '', logoUpdatedAt: 0 });
      });
  }

  saveSiteLogo = () => {
    if (this.state.saving) return;
    const mime = extractMime(this.state.logoPreview);
    const data = stripBase64DataUrl(this.state.logoPreview);
    if (!mime || !data) {
      this.setNotice('error', 'Vui lòng chọn logo trước khi lưu.');
      notifyWarning('Vui lòng chọn logo trước khi lưu.');
      return;
    }
    const config = { headers: { 'x-access-token': this.context.token } };
    this.setState({ saving: true });
    axios
      .put('/api/admin/settings/site-logo', { mime, data }, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (ok) {
          this.setNotice('success', 'Đã lưu logo.');
          notifySuccess('Đã lưu logo.');
          this.setState({ logoUpdatedAt: res.data.updatedAt || Date.now() });
        } else {
          this.setNotice('error', 'Lưu thất bại.');
          notifyError('Lưu thất bại.');
        }
      })
      .catch((err) => {
        const msg =
          (err && err.response && err.response.data && err.response.data.message) ||
          'Lưu thất bại.';
        this.setNotice('error', msg);
        notifyError(msg);
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  saveAuthHeroBg = () => {
    if (this.state.saving) return;
    const mime = extractMime(this.state.bgPreview);
    const data = stripBase64DataUrl(this.state.bgPreview);
    if (!mime || !data) {
      this.setNotice('error', 'Vui lòng chọn ảnh background trước khi lưu.');
      notifyWarning('Vui lòng chọn ảnh background trước khi lưu.');
      return;
    }
    const config = { headers: { 'x-access-token': this.context.token } };
    this.setState({ saving: true });
    axios
      .put('/api/admin/settings/auth-hero-bg', { mime, data }, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (ok) {
          this.setNotice('success', 'Đã lưu background đăng nhập/đăng ký.');
          notifySuccess('Đã lưu background đăng nhập/đăng ký.');
          this.setState({ updatedAt: res.data.updatedAt || Date.now() });
        } else {
          this.setNotice('error', 'Lưu thất bại.');
          notifyError('Lưu thất bại.');
        }
      })
      .catch((err) => {
        const msg =
          (err && err.response && err.response.data && err.response.data.message) ||
          'Lưu thất bại.';
        this.setNotice('error', msg);
        notifyError(msg);
      })
      .finally(() => {
        this.setState({ saving: false });
      });
  };

  render() {
    const { loading, saving, bgPreview, logoPreview, notice, updatedAt, logoUpdatedAt } = this.state;
    const last =
      updatedAt && updatedAt > 0
        ? new Date(updatedAt).toLocaleString('vi-VN')
        : '—';
    const lastLogo =
      logoUpdatedAt && logoUpdatedAt > 0
        ? new Date(logoUpdatedAt).toLocaleString('vi-VN')
        : '—';

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Cài đặt giao diện</h1>
        <p className="ad-page__lead">
          Tải ảnh background cho màn hình đăng nhập/đăng ký (client-customer).
        </p>

        <div className="ad-card">
          <div className="ad-card__head">
            <h2 className="ad-card__title">Auth background</h2>
          </div>
          <div className="ad-card__body">
            {loading ? (
              <p style={{ margin: 0, color: 'var(--ad-muted)' }}>Đang tải…</p>
            ) : (
              <>
                <div className="ad-form__group">
                  <label className="ad-form__label" htmlFor="ad-auth-bg">
                    Ảnh background (khuyến nghị 1600×900, JPG/PNG)
                  </label>
                  <input
                    id="ad-auth-bg"
                    className="ad-form__file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={this.previewBg}
                  />
                </div>

                {bgPreview ? (
                  <div style={{ marginTop: 14 }}>
                    <div
                      style={{
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid rgba(15,23,42,0.12)',
                        background: '#0b0f14',
                        maxWidth: 720,
                      }}
                    >
                      <img
                        src={bgPreview}
                        alt="Xem trước background"
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                      />
                    </div>
                    <p style={{ marginTop: 10, color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                      Lần cập nhật gần nhất: {last}
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: '10px 0 0', color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                    Chưa có ảnh. Ứng dụng sẽ dùng gradient mặc định.
                  </p>
                )}

                {notice ? (
                  <p
                    style={{
                      marginTop: 14,
                      padding: '10px 12px',
                      borderRadius: 12,
                      background:
                        notice.type === 'success'
                          ? 'rgba(22,163,74,0.10)'
                          : 'rgba(220,38,38,0.10)',
                      border:
                        notice.type === 'success'
                          ? '1px solid rgba(22,163,74,0.25)'
                          : '1px solid rgba(220,38,38,0.25)',
                      color: notice.type === 'success' ? '#166534' : '#991b1b',
                      fontSize: '0.92rem',
                    }}
                  >
                    {notice.text}
                  </p>
                ) : null}

                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="ad-btn ad-btn--primary"
                    onClick={this.saveAuthHeroBg}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn--ghost"
                    onClick={() => this.apiGetAuthHeroBg()}
                    disabled={saving}
                  >
                    Tải lại
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="ad-card" style={{ marginTop: 18 }}>
          <div className="ad-card__head">
            <h2 className="ad-card__title">Logo</h2>
          </div>
          <div className="ad-card__body">
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-site-logo">
                Logo header (khuyến nghị PNG/SVG, nền trong, cao ~64px)
              </label>
              <input
                id="ad-site-logo"
                className="ad-form__file"
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/webp"
                onChange={this.previewLogo}
              />
            </div>

            {logoPreview ? (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid rgba(15,23,42,0.12)',
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,58,138,0.9) 100%)',
                    padding: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 220,
                  }}
                >
                  <img
                    src={logoPreview}
                    alt="Xem trước logo"
                    style={{ display: 'block', maxHeight: 64, width: 'auto' }}
                  />
                </div>
                <p style={{ margin: 0, color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                  Lần cập nhật gần nhất: {lastLogo}
                </p>
              </div>
            ) : (
              <p style={{ margin: '10px 0 0', color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                Chưa có logo. Client sẽ dùng ảnh mặc định trong public.
              </p>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ad-btn ad-btn--primary"
                onClick={this.saveSiteLogo}
                disabled={saving}
              >
                {saving ? 'Đang lưu…' : 'Lưu logo'}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--ghost"
                onClick={() => this.apiGetSiteLogo()}
                disabled={saving}
              >
                Tải lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings;

