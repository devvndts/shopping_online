import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { notifyPromise, notifyWarning } from '../utils/notify';

class Settings extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      saving: false,
      bgPreview: '',
      logoPreview: '',
      faviconPreview: '',
      bgImageFile: null,
      logoImageFile: null,
      faviconImageFile: null,
      bgManualUrl: '',
      logoManualUrl: '',
      faviconManualUrl: '',
      siteTitle: '',
      notice: null,
      updatedAt: 0,
      logoUpdatedAt: 0,
      faviconUpdatedAt: 0,
      titleUpdatedAt: 0,
    };
    this._bgObjectUrl = null;
    this._logoObjectUrl = null;
    this._faviconObjectUrl = null;
  }

  componentWillUnmount() {
    if (this._bgObjectUrl) URL.revokeObjectURL(this._bgObjectUrl);
    if (this._logoObjectUrl) URL.revokeObjectURL(this._logoObjectUrl);
    if (this._faviconObjectUrl) URL.revokeObjectURL(this._faviconObjectUrl);
  }

  componentDidMount() {
    this.apiGetAuthHeroBg();
    this.apiGetSiteLogo();
    this.apiGetSiteFavicon();
    this.apiGetSiteTitle();
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
    if (this._bgObjectUrl) URL.revokeObjectURL(this._bgObjectUrl);
    this._bgObjectUrl = URL.createObjectURL(file);
    this.setState({
      bgPreview: this._bgObjectUrl,
      bgImageFile: file,
      bgManualUrl: '',
      notice: null,
    });
  };

  onBgUrlChange = (e) => {
    const v = (e.target.value || '').trim();
    if (this._bgObjectUrl) {
      URL.revokeObjectURL(this._bgObjectUrl);
      this._bgObjectUrl = null;
    }
    const show = /^https?:\/\//i.test(v) ? v : '';
    this.setState({
      bgManualUrl: e.target.value,
      bgImageFile: null,
      bgPreview: show,
      notice: null,
    });
  };

  apiGetAuthHeroBg() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/settings/auth-hero-bg', config)
      .then((res) => {
        const row = res.data || {};
        const u = (row.imageUrl || '').trim();
        if (u) {
          this.setState({
            bgPreview: u,
            bgManualUrl: u,
            bgImageFile: null,
            updatedAt: row.updatedAt || 0,
            loading: false,
          });
        } else {
          this.setState({ bgPreview: '', bgManualUrl: '', updatedAt: 0, loading: false });
        }
      })
      .catch(() => {
        this.setState({ bgPreview: '', bgManualUrl: '', updatedAt: 0, loading: false });
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
    if (this._logoObjectUrl) URL.revokeObjectURL(this._logoObjectUrl);
    this._logoObjectUrl = URL.createObjectURL(file);
    this.setState({
      logoPreview: this._logoObjectUrl,
      logoImageFile: file,
      logoManualUrl: '',
      notice: null,
    });
  };

  onLogoUrlChange = (e) => {
    const v = (e.target.value || '').trim();
    if (this._logoObjectUrl) {
      URL.revokeObjectURL(this._logoObjectUrl);
      this._logoObjectUrl = null;
    }
    const show = /^https?:\/\//i.test(v) ? v : '';
    this.setState({
      logoManualUrl: e.target.value,
      logoImageFile: null,
      logoPreview: show,
      notice: null,
    });
  };

  apiGetSiteLogo() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/settings/site-logo', config)
      .then((res) => {
        const row = res.data || {};
        const u = (row.imageUrl || '').trim();
        if (u) {
          this.setState({
            logoPreview: u,
            logoManualUrl: u,
            logoImageFile: null,
            logoUpdatedAt: row.updatedAt || 0,
          });
        } else {
          this.setState({ logoPreview: '', logoManualUrl: '', logoUpdatedAt: 0 });
        }
      })
      .catch(() => {
        this.setState({ logoPreview: '', logoManualUrl: '', logoUpdatedAt: 0 });
      });
  }

  previewFavicon = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      this.setNotice('error', 'Vui lòng chọn file ảnh.');
      notifyWarning('Vui lòng chọn file ảnh.');
      return;
    }
    if (this._faviconObjectUrl) URL.revokeObjectURL(this._faviconObjectUrl);
    this._faviconObjectUrl = URL.createObjectURL(file);
    this.setState({
      faviconPreview: this._faviconObjectUrl,
      faviconImageFile: file,
      faviconManualUrl: '',
      notice: null,
    });
  };

  onFaviconUrlChange = (e) => {
    const v = (e.target.value || '').trim();
    if (this._faviconObjectUrl) {
      URL.revokeObjectURL(this._faviconObjectUrl);
      this._faviconObjectUrl = null;
    }
    const show = /^https?:\/\//i.test(v) ? v : '';
    this.setState({
      faviconManualUrl: e.target.value,
      faviconImageFile: null,
      faviconPreview: show,
      notice: null,
    });
  };

  apiGetSiteFavicon() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/settings/site-favicon', config)
      .then((res) => {
        const row = res.data || {};
        const u = (row.imageUrl || '').trim();
        if (u) {
          this.setState({
            faviconPreview: u,
            faviconManualUrl: u,
            faviconImageFile: null,
            faviconUpdatedAt: row.updatedAt || 0,
          });
        } else {
          this.setState({
            faviconPreview: '',
            faviconManualUrl: '',
            faviconImageFile: null,
            faviconUpdatedAt: 0,
          });
        }
      })
      .catch(() => {
        this.setState({ faviconPreview: '', faviconManualUrl: '', faviconUpdatedAt: 0 });
      });
  }

  apiGetSiteTitle() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/settings/site-title', config)
      .then((res) => {
        const row = res.data || {};
        this.setState({
          siteTitle: row.title || '',
          titleUpdatedAt: row.updatedAt || 0,
        });
      })
      .catch(() => {
        this.setState({ siteTitle: '', titleUpdatedAt: 0 });
      });
  }

  saveSiteFavicon = () => {
    if (this.state.saving) return;
    const hasFile = !!this.state.faviconImageFile;
    const url = (this.state.faviconManualUrl || '').trim();
    const hasUrl = /^https?:\/\//i.test(url);
    if (!hasFile && !hasUrl) {
      this.setNotice('error', 'Chọn file ảnh hoặc nhập URL https.');
      notifyWarning('Chọn file ảnh hoặc nhập URL https.');
      return;
    }
    const config = { headers: { 'x-access-token': this.context.token } };
    const fd = new FormData();
    if (hasFile) fd.append('image', this.state.faviconImageFile);
    else fd.append('imageUrl', url);
    this.setState({ saving: true });
    const req = axios
      .put('/api/admin/settings/site-favicon', fd, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (!ok) throw new Error((res.data && res.data.message) || 'Lưu thất bại.');
        this.setState({
          faviconUpdatedAt: res.data.updatedAt || Date.now(),
          faviconPreview: res.data.imageUrl || this.state.faviconPreview,
          faviconManualUrl: res.data.imageUrl || url,
          faviconImageFile: null,
        });
      })
      .finally(() => this.setState({ saving: false }));
    notifyPromise(req, {
      pending: 'Đang lưu favicon…',
      success: 'Đã lưu favicon.',
      error: 'Lưu favicon thất bại.',
    });
  };

  saveSiteTitle = () => {
    if (this.state.saving) return;
    const title = (this.state.siteTitle || '').trim();
    if (!title) {
      this.setNotice('error', 'Vui lòng nhập tên hiển thị trên tab.');
      notifyWarning('Vui lòng nhập tên hiển thị trên tab.');
      return;
    }
    const config = { headers: { 'x-access-token': this.context.token } };
    this.setState({ saving: true });
    const req = axios
      .put('/api/admin/settings/site-title', { title }, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (!ok) throw new Error((res.data && res.data.message) || 'Lưu thất bại.');
        this.setState({
          siteTitle: res.data.title || title,
          titleUpdatedAt: res.data.updatedAt || Date.now(),
        });
      })
      .finally(() => this.setState({ saving: false }));
    notifyPromise(req, {
      pending: 'Đang lưu title…',
      success: 'Đã lưu title.',
      error: 'Lưu title thất bại.',
    });
  };

  saveSiteLogo = () => {
    if (this.state.saving) return;
    const hasFile = !!this.state.logoImageFile;
    const url = (this.state.logoManualUrl || '').trim();
    const hasUrl = /^https?:\/\//i.test(url);
    if (!hasFile && !hasUrl) {
      this.setNotice('error', 'Chọn file ảnh hoặc nhập URL https.');
      notifyWarning('Chọn file ảnh hoặc nhập URL https.');
      return;
    }
    const config = { headers: { 'x-access-token': this.context.token } };
    const fd = new FormData();
    if (hasFile) fd.append('image', this.state.logoImageFile);
    else fd.append('imageUrl', url);
    this.setState({ saving: true });
    const req = axios
      .put('/api/admin/settings/site-logo', fd, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (!ok) throw new Error((res.data && res.data.message) || 'Lưu thất bại.');
        this.setState({
          logoUpdatedAt: res.data.updatedAt || Date.now(),
          logoPreview: res.data.imageUrl || this.state.logoPreview,
          logoManualUrl: res.data.imageUrl || url,
          logoImageFile: null,
        });
      })
      .finally(() => {
        this.setState({ saving: false });
      });
    notifyPromise(req, {
      pending: 'Đang tải lên logo…',
      success: 'Đã lưu logo.',
      error: 'Lưu logo thất bại.',
    });
  };

  saveAuthHeroBg = () => {
    if (this.state.saving) return;
    const hasFile = !!this.state.bgImageFile;
    const url = (this.state.bgManualUrl || '').trim();
    const hasUrl = /^https?:\/\//i.test(url);
    if (!hasFile && !hasUrl) {
      this.setNotice('error', 'Chọn file ảnh hoặc nhập URL https.');
      notifyWarning('Chọn file ảnh hoặc nhập URL https.');
      return;
    }
    const config = { headers: { 'x-access-token': this.context.token } };
    const fd = new FormData();
    if (hasFile) fd.append('image', this.state.bgImageFile);
    else fd.append('imageUrl', url);
    this.setState({ saving: true });
    const req = axios
      .put('/api/admin/settings/auth-hero-bg', fd, config)
      .then((res) => {
        const ok = res.data && res.data.success;
        if (!ok) throw new Error((res.data && res.data.message) || 'Lưu thất bại.');
        this.setState({
          updatedAt: res.data.updatedAt || Date.now(),
          bgPreview: res.data.imageUrl || this.state.bgPreview,
          bgManualUrl: res.data.imageUrl || url,
          bgImageFile: null,
        });
      })
      .finally(() => {
        this.setState({ saving: false });
      });
    notifyPromise(req, {
      pending: 'Đang tải lên background…',
      success: 'Đã lưu background đăng nhập/đăng ký.',
      error: 'Lưu background thất bại.',
    });
  };

  render() {
    const {
      loading,
      saving,
      bgPreview,
      logoPreview,
      faviconPreview,
      notice,
      updatedAt,
      logoUpdatedAt,
      faviconUpdatedAt,
      titleUpdatedAt,
    } = this.state;
    const last =
      updatedAt && updatedAt > 0
        ? new Date(updatedAt).toLocaleString('vi-VN')
        : '—';
    const lastLogo =
      logoUpdatedAt && logoUpdatedAt > 0
        ? new Date(logoUpdatedAt).toLocaleString('vi-VN')
        : '—';
    const lastFavicon =
      faviconUpdatedAt && faviconUpdatedAt > 0
        ? new Date(faviconUpdatedAt).toLocaleString('vi-VN')
        : '—';
    const lastTitle =
      titleUpdatedAt && titleUpdatedAt > 0
        ? new Date(titleUpdatedAt).toLocaleString('vi-VN')
        : '—';

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Cài đặt giao diện</h1>
        
        <div className="ad-card">
          <div className="ad-card__head">
            <h2 className="ad-card__title">Meta: Title trên tab</h2>
          </div>
          <div className="ad-card__body">
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-site-title">
                Tên hiển thị trên tab (document.title)
              </label>
              <input
                id="ad-site-title"
                className="ad-form__input"
                type="text"
                value={this.state.siteTitle}
                onChange={(e) => this.setState({ siteTitle: e.target.value })}
                placeholder="VD: VLU Laptop Shop"
              />
              <p style={{ marginTop: 10, color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                Lần cập nhật gần nhất: {lastTitle}
              </p>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ad-btn ad-btn--primary"
                onClick={this.saveSiteTitle}
                disabled={saving}
              >
                {saving ? 'Đang lưu…' : 'Lưu title'}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--ghost"
                onClick={() => this.apiGetSiteTitle()}
                disabled={saving}
              >
                Tải lại
              </button>
            </div>
          </div>
        </div>

        <div className="ad-card" style={{ marginTop: 18 }}>
          <div className="ad-card__head">
            <h2 className="ad-card__title">Favicon</h2>
          </div>
          <div className="ad-card__body">
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-site-favicon">
                Favicon (khuyến nghị PNG 64×64 hoặc ICO)
              </label>
              <input
                id="ad-site-favicon"
                className="ad-form__file"
                type="file"
                accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
                onChange={this.previewFavicon}
              />
            </div>
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-site-favicon-url">
                Hoặc URL https
              </label>
              <input
                id="ad-site-favicon-url"
                className="ad-form__input"
                type="url"
                value={this.state.faviconManualUrl}
                onChange={this.onFaviconUrlChange}
                placeholder="https://"
              />
            </div>

            {faviconPreview ? (
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid rgba(15,23,42,0.12)',
                    background: '#fff',
                    padding: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 86,
                    height: 86,
                  }}
                >
                  <img
                    src={faviconPreview}
                    alt="Xem trước favicon"
                    style={{ display: 'block', width: 32, height: 32, objectFit: 'contain' }}
                  />
                </div>
                <p style={{ margin: 0, color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                  Lần cập nhật gần nhất: {lastFavicon}
                </p>
              </div>
            ) : (
              <p style={{ margin: '10px 0 0', color: 'var(--ad-muted)', fontSize: '0.9rem' }}>
                Chưa có favicon. Client sẽ dùng `public/favicon.ico`.
              </p>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ad-btn ad-btn--primary"
                onClick={this.saveSiteFavicon}
                disabled={saving}
              >
                {saving ? 'Đang lưu…' : 'Lưu favicon'}
              </button>
              <button
                type="button"
                className="ad-btn ad-btn--ghost"
                onClick={() => this.apiGetSiteFavicon()}
                disabled={saving}
              >
                Tải lại
              </button>
            </div>
          </div>
        </div>

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
                <div className="ad-form__group">
                  <label className="ad-form__label" htmlFor="ad-auth-bg-url">
                    Hoặc URL https
                  </label>
                  <input
                    id="ad-auth-bg-url"
                    className="ad-form__input"
                    type="url"
                    value={this.state.bgManualUrl}
                    onChange={this.onBgUrlChange}
                    placeholder="https://"
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
                Logo header (khuyến nghị PNG, nền trong, cao ~64px)
              </label>
              <input
                id="ad-site-logo"
                className="ad-form__file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={this.previewLogo}
              />
            </div>
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-site-logo-url">
                Hoặc URL https
              </label>
              <input
                id="ad-site-logo-url"
                className="ad-form__input"
                type="url"
                value={this.state.logoManualUrl}
                onChange={this.onLogoUrlChange}
                placeholder="https://"
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
