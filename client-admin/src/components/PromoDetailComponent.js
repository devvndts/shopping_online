import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';
import { notifyPromise } from '../utils/notify';

function normalizeCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

class PromoDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtCode: '',
      txtName: '',
      txtDescription: '',
      txtType: 'PERCENT',
      txtValue: '10',
      txtMinSubtotal: '0',
      txtMaxDiscount: '',
      active: true,
      txtStartAt: '',
      txtEndAt: '',
      notice: null,
    };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isOpen) return;
    const opened = !prevProps.isOpen && this.props.isOpen;
    const itemChanged =
      this.props.mode === 'edit' &&
      this.props.item &&
      prevProps.item !== this.props.item;
    if (opened || itemChanged) {
      this.syncFormFromProps();
    }
  }

  syncFormFromProps() {
    const toLocalInput = (ms) => {
      const n = Number(ms) || 0;
      if (!n) return '';
      const d = new Date(n);
      const pad = (x) => String(x).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    };

    if (this.props.mode === 'edit' && this.props.item) {
      const it = this.props.item;
      this.setState({
        txtID: it._id || '',
        txtCode: it.code || '',
        txtName: it.name || '',
        txtDescription: it.description || '',
        txtType: String(it.type || 'PERCENT').toUpperCase(),
        txtValue: String(it.value != null ? it.value : ''),
        txtMinSubtotal: String(it.minSubtotal != null ? it.minSubtotal : 0),
        txtMaxDiscount: it.maxDiscount != null ? String(it.maxDiscount) : '',
        active: it.active === 1,
        txtStartAt: toLocalInput(it.startAt),
        txtEndAt: toLocalInput(it.endAt),
        notice: null,
      });
    } else {
      this.setState({
        txtID: '',
        txtCode: '',
        txtName: '',
        txtDescription: '',
        txtType: 'PERCENT',
        txtValue: '10',
        txtMinSubtotal: '0',
        txtMaxDiscount: '',
        active: true,
        txtStartAt: '',
        txtEndAt: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  apiGetPromos() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/promos', config).then((res) => {
      this.props.updatePromos(res.data || []);
    });
  }

  parseDateToMs(localStr) {
    const s = String(localStr || '').trim();
    if (!s) return 0;
    const ms = Date.parse(s);
    return Number.isFinite(ms) ? ms : 0;
  }

  buildBody() {
    const code = normalizeCode(this.state.txtCode);
    const type = String(this.state.txtType || 'PERCENT').toUpperCase();
    const value = Number(this.state.txtValue) || 0;
    const minSubtotal = Number(this.state.txtMinSubtotal) || 0;
    const maxDiscount = this.state.txtMaxDiscount !== '' ? Number(this.state.txtMaxDiscount) || 0 : '';
    const startAt = this.parseDateToMs(this.state.txtStartAt);
    const endAt = this.parseDateToMs(this.state.txtEndAt);

    return {
      code,
      name: (this.state.txtName || '').trim(),
      description: (this.state.txtDescription || '').trim(),
      type,
      value,
      minSubtotal,
      maxDiscount,
      active: this.state.active ? 1 : 0,
      startAt,
      endAt,
    };
  }

  btnAddClick = (e) => {
    e.preventDefault();
    const body = this.buildBody();
    if (!body.code) return this.setNotice('error', 'Vui lòng nhập code.');
    if (!body.type) return this.setNotice('error', 'Thiếu loại.');
    if (body.value <= 0) return this.setNotice('error', 'Giá trị phải > 0.');
    this.setNotice(null);
    this.apiPostPromo(body);
  };

  btnUpdateClick = (e) => {
    e.preventDefault();
    const id = this.state.txtID;
    const body = this.buildBody();
    if (!id) return this.setNotice('error', 'Thiếu ID.');
    if (!body.code) return this.setNotice('error', 'Vui lòng nhập code.');
    if (body.value <= 0) return this.setNotice('error', 'Giá trị phải > 0.');
    this.setNotice(null);
    this.apiPutPromo(id, body);
  };

  btnDeleteClick = (e) => {
    e.preventDefault();
    const id = this.state.txtID;
    if (!id) return this.setNotice('error', 'Không có mã để xoá.');
    if (!window.confirm('Xoá mã khuyến mãi này?')) return;
    this.setNotice(null);
    this.apiDeletePromo(id);
  };

  apiPostPromo(body) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .post('/api/admin/promos', body, config)
      .then((res) => {
        if (res.data) {
          this.apiGetPromos();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Tạo mã thất bại.');
        }
      })
      .catch((err) => {
        const msg =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : 'Lỗi khi tạo mã.';
        this.setNotice('error', msg);
      });
  }

  apiPutPromo(id, body) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.put('/api/admin/promos/' + id, body, config).then((res) => {
      if (!res.data) throw new Error('Cập nhật thất bại.');
      this.apiGetPromos();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang cập nhật mã…',
      success: 'Đã cập nhật mã.',
      error: 'Cập nhật mã thất bại.',
    });
  }

  apiDeletePromo(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.delete('/api/admin/promos/' + id, config).then((res) => {
      if (!res.data) throw new Error('Xoá thất bại.');
      this.apiGetPromos();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang xoá mã…',
      success: 'Đã xoá mã.',
      error: 'Xoá mã thất bại.',
    });
  }

  render() {
    const { isOpen, mode, onClose } = this.props;
    const isEdit = mode === 'edit';
    const { notice } = this.state;
    const code = normalizeCode(this.state.txtCode);
    const type = String(this.state.txtType || 'PERCENT').toUpperCase();
    const valueNum = Number(this.state.txtValue) || 0;
    const minSubtotalNum = Number(this.state.txtMinSubtotal) || 0;
    const maxDiscountNum =
      this.state.txtMaxDiscount !== '' ? Number(this.state.txtMaxDiscount) || 0 : null;

    return (
      <AdminModal
        isOpen={isOpen}
        title={isEdit ? 'Sửa mã khuyến mãi' : 'Thêm mã khuyến mãi'}
        subtitle="Thiết lập điều kiện áp dụng, thời gian hiệu lực và trạng thái."
        onClose={onClose}
        extraWide
      >
        {notice ? (
          <div
            className={
              'ad-alert' +
              (notice.type === 'success'
                ? ' ad-alert--success'
                : ' ad-alert--error')
            }
            role="status"
          >
            {notice.text}
          </div>
        ) : null}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="ad-promo-layout">
            <div className="ad-promo-layout__col">
              {isEdit && this.state.txtID ? (
                <p className="ad-prod-meta" style={{ marginBottom: 14 }}>
                  <span className="ad-prod-meta__label">ID</span>{' '}
                  <code className="ad-prod-meta__value">{this.state.txtID}</code>
                </p>
              ) : null}

              <div className="ad-form__group">
                <div className="ad-form__grid2">
                  <div>
                    <label className="ad-form__label" htmlFor="ad-promo-code">
                      Code
                    </label>
                    <input
                      id="ad-promo-code"
                      className="ad-form__input"
                      type="text"
                      value={this.state.txtCode}
                      onChange={(e) =>
                        this.setState({ txtCode: e.target.value, notice: null })
                      }
                      placeholder="VD: SALE10"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="ad-form__label" htmlFor="ad-promo-active">
                      Trạng thái
                    </label>
                    <select
                      id="ad-promo-active"
                      className="ad-form__select"
                      value={this.state.active ? '1' : '0'}
                      onChange={(e) =>
                        this.setState({
                          active: e.target.value === '1',
                          notice: null,
                        })
                      }
                    >
                      <option value="1">ACTIVE</option>
                      <option value="0">OFF</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label" htmlFor="ad-promo-name">
                  Tên hiển thị
                </label>
                <input
                  id="ad-promo-name"
                  className="ad-form__input"
                  type="text"
                  value={this.state.txtName}
                  onChange={(e) =>
                    this.setState({ txtName: e.target.value, notice: null })
                  }
                  placeholder="VD: Giảm 10% đơn hàng"
                />
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label" htmlFor="ad-promo-desc">
                  Mô tả (ngắn)
                </label>
                <input
                  id="ad-promo-desc"
                  className="ad-form__input"
                  type="text"
                  value={this.state.txtDescription}
                  onChange={(e) =>
                    this.setState({ txtDescription: e.target.value, notice: null })
                  }
                  placeholder="VD: Áp dụng cho đơn từ 5.000.000đ"
                />
              </div>

              <div className="ad-promo-section">
                <div className="ad-promo-section__title">Giá trị giảm</div>
                <div className="ad-form__grid2">
                  <div className="ad-form__group" style={{ marginBottom: 0 }}>
                    <label className="ad-form__label" htmlFor="ad-promo-type">
                      Loại
                    </label>
                    <select
                      id="ad-promo-type"
                      className="ad-form__select"
                      value={this.state.txtType}
                      onChange={(e) =>
                        this.setState({ txtType: e.target.value, notice: null })
                      }
                    >
                      <option value="PERCENT">PERCENT (%)</option>
                      <option value="FIXED">FIXED (tiền)</option>
                    </select>
                  </div>
                  <div className="ad-form__group" style={{ marginBottom: 0 }}>
                    <label className="ad-form__label" htmlFor="ad-promo-value">
                      Giá trị
                    </label>
                    <input
                      id="ad-promo-value"
                      className="ad-form__input"
                      type="number"
                      value={this.state.txtValue}
                      onChange={(e) =>
                        this.setState({ txtValue: e.target.value, notice: null })
                      }
                      min="0"
                      placeholder={type === 'PERCENT' ? 'VD: 10' : 'VD: 500000'}
                    />
                  </div>
                </div>
              </div>

              <div className="ad-promo-section">
                <div className="ad-promo-section__title">Điều kiện áp dụng</div>
                <div className="ad-form__grid2">
                  <div className="ad-form__group" style={{ marginBottom: 0 }}>
                    <label className="ad-form__label" htmlFor="ad-promo-min">
                      Đơn tối thiểu
                    </label>
                    <input
                      id="ad-promo-min"
                      className="ad-form__input"
                      type="number"
                      value={this.state.txtMinSubtotal}
                      onChange={(e) =>
                        this.setState({
                          txtMinSubtotal: e.target.value,
                          notice: null,
                        })
                      }
                      min="0"
                      placeholder="VD: 5000000"
                    />
                  </div>
                  <div className="ad-form__group" style={{ marginBottom: 0 }}>
                    <label className="ad-form__label" htmlFor="ad-promo-cap">
                      Giảm tối đa
                    </label>
                    <input
                      id="ad-promo-cap"
                      className="ad-form__input"
                      type="number"
                      value={this.state.txtMaxDiscount}
                      onChange={(e) =>
                        this.setState({
                          txtMaxDiscount: e.target.value,
                          notice: null,
                        })
                      }
                      min="0"
                      placeholder="Tuỳ chọn"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="ad-promo-layout__col ad-promo-layout__col--preview">
              <div className="ad-coupon-preview">
                <div className="ad-coupon-preview__top">
                  <div className="ad-coupon-preview__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8.5C3 7.119 4.119 6 5.5 6H18.5C19.881 6 21 7.119 21 8.5V10a2 2 0 0 0 0 4v1.5c0 1.381-1.119 2.5-2.5 2.5H5.5C4.119 20 3 18.881 3 17.5V16a2 2 0 0 0 0-4V8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M9 9.25h.01M9 12h.01M9 14.75h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="ad-coupon-preview__meta">
                    <div className="ad-coupon-preview__code">{code || 'CODE'}</div>
                    <div className="ad-coupon-preview__name">
                      {(this.state.txtName || '').trim() || 'Tên hiển thị mã khuyến mãi'}
                    </div>
                  </div>
                  <div className={'ad-pill' + (this.state.active ? ' ad-pill--ok' : '')}>
                    {this.state.active ? 'ACTIVE' : 'OFF'}
                  </div>
                </div>

                <div className="ad-coupon-preview__body">
                  <div className="ad-coupon-preview__value">
                    {type === 'PERCENT' ? `${valueNum || 0}%` : `${valueNum || 0}₫`}
                  </div>
                  <div className="ad-coupon-preview__desc">
                    {(this.state.txtDescription || '').trim() ||
                      'Mô tả ngắn sẽ hiển thị cho khách ở bước checkout.'}
                  </div>

                  <div className="ad-coupon-preview__rules">
                    <div className="ad-coupon-preview__rule">
                      <span className="ad-coupon-preview__dot" aria-hidden="true" />
                      Đơn tối thiểu: <b>{minSubtotalNum || 0}₫</b>
                    </div>
                    {type === 'PERCENT' && maxDiscountNum != null ? (
                      <div className="ad-coupon-preview__rule">
                        <span className="ad-coupon-preview__dot" aria-hidden="true" />
                        Giảm tối đa: <b>{maxDiscountNum || 0}₫</b>
                      </div>
                    ) : null}
                    {this.state.txtStartAt ? (
                      <div className="ad-coupon-preview__rule">
                        <span className="ad-coupon-preview__dot" aria-hidden="true" />
                        Bắt đầu: <b>{this.state.txtStartAt.replace('T', ' ')}</b>
                      </div>
                    ) : null}
                    {this.state.txtEndAt ? (
                      <div className="ad-coupon-preview__rule">
                        <span className="ad-coupon-preview__dot" aria-hidden="true" />
                        Kết thúc: <b>{this.state.txtEndAt.replace('T', ' ')}</b>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="ad-promo-section">
                <div className="ad-promo-section__title">Hiệu lực thời gian</div>
                <div className="ad-form__grid2">
                  <div className="ad-form__group" style={{ marginBottom: 0 }}>
                    <label className="ad-form__label" htmlFor="ad-promo-start">
                      Bắt đầu
                    </label>
                    <input
                      id="ad-promo-start"
                      className="ad-form__input"
                      type="datetime-local"
                      value={this.state.txtStartAt}
                      onChange={(e) =>
                        this.setState({ txtStartAt: e.target.value, notice: null })
                      }
                    />
                  </div>
                  <div className="ad-form__group" style={{ marginBottom: 0 }}>
                    <label className="ad-form__label" htmlFor="ad-promo-end">
                      Kết thúc
                    </label>
                    <input
                      id="ad-promo-end"
                      className="ad-form__input"
                      type="datetime-local"
                      value={this.state.txtEndAt}
                      onChange={(e) =>
                        this.setState({ txtEndAt: e.target.value, notice: null })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ad-form__actions">
            {!isEdit ? (
              <>
                <button
                  type="button"
                  className="ad-btn ad-btn--primary"
                  onClick={this.btnAddClick}
                >
                  Thêm mới
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn--ghost"
                  onClick={onClose}
                >
                  Huỷ
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="ad-btn ad-btn--neutral"
                  onClick={this.btnUpdateClick}
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn--danger"
                  onClick={this.btnDeleteClick}
                >
                  Xoá
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn--ghost"
                  onClick={onClose}
                >
                  Đóng
                </button>
              </>
            )}
          </div>
        </form>
      </AdminModal>
    );
  }
}

export default PromoDetail;

