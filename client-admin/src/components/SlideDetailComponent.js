import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';
import { notifyError, notifySuccess } from '../utils/notify';

function stripBase64DataUrl(raw) {
  if (!raw) return '';
  return String(raw).replace(/^data:([^;]+);base64,/i, '');
}

function extractMime(raw) {
  if (!raw) return '';
  const m = String(raw).match(/^data:([^;]+);base64,/i);
  return m ? m[1] : '';
}

class SlideDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtTitle: '',
      txtSubtitle: '',
      txtHref: '',
      txtSort: '0',
      chkActive: true,
      imgSlide: '',
      notice: null,
    };
  }

  componentDidMount() {
    this.syncFromProps();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open || prevProps.item !== this.props.item) {
      this.syncFromProps();
    }
  }

  syncFromProps() {
    const { item } = this.props;
    if (item) {
      this.setState({
        txtID: item._id || '',
        txtTitle: item.title || '',
        txtSubtitle: item.subtitle || '',
        txtHref: item.href || '',
        txtSort: String(item.sort ?? 0),
        chkActive: item.active === 1,
        imgSlide:
          item.imageMime && item.imageData
            ? `data:${item.imageMime};base64,${item.imageData}`
            : '',
        notice: null,
      });
    } else {
      this.setState({
        txtID: '',
        txtTitle: '',
        txtSubtitle: '',
        txtHref: '',
        txtSort: '0',
        chkActive: true,
        imgSlide: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  previewImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      this.setNotice('error', 'Vui lòng chọn file ảnh.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      this.setState({ imgSlide: evt.target.result, notice: null });
    };
    reader.readAsDataURL(file);
  };

  btnSave = (e) => {
    e.preventDefault();
    const { onClose, onSaved } = this.props;
    const isEdit = !!this.state.txtID;

    const title = (this.state.txtTitle || '').trim();
    const subtitle = (this.state.txtSubtitle || '').trim();
    const href = (this.state.txtHref || '').trim();
    const sort = parseInt(this.state.txtSort, 10) || 0;
    const active = this.state.chkActive ? 1 : 0;
    const imageMime = extractMime(this.state.imgSlide);
    const imageData = stripBase64DataUrl(this.state.imgSlide);

    if (!imageMime || !imageData) {
      this.setNotice('error', 'Vui lòng tải ảnh slide.');
      return;
    }

    const config = { headers: { 'x-access-token': this.context.token } };
    const body = { title, subtitle, href, sort, active, imageMime, imageData };

    const req = isEdit
      ? axios.put('/api/admin/slides/' + this.state.txtID, body, config)
      : axios.post('/api/admin/slides', body, config);

    req
      .then(() => {
        notifySuccess(isEdit ? 'Đã lưu slide.' : 'Đã tạo slide.');
        if (onSaved) onSaved();
        if (onClose) onClose();
      })
      .catch((err) => {
        const msg =
          (err && err.response && err.response.data && err.response.data.message) ||
          'Lưu slide thất bại.';
        this.setNotice('error', msg);
        notifyError(msg);
      });
  };

  btnDelete = (e) => {
    e.preventDefault();
    const { onClose, onSaved } = this.props;
    const id = this.state.txtID;
    if (!id) return;
    if (!window.confirm('Xoá slide này?')) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .delete('/api/admin/slides/' + id, config)
      .then(() => {
        notifySuccess('Đã xoá slide.');
        if (onSaved) onSaved();
        if (onClose) onClose();
      })
      .catch(() => {
        this.setNotice('error', 'Xoá slide thất bại.');
        notifyError('Xoá slide thất bại.');
      });
  };

  render() {
    const { open, onClose, item } = this.props;
    const isEdit = !!item;

    return (
      <AdminModal
        isOpen={open}
        title={isEdit ? 'Cập nhật slide' : 'Thêm slide'}
        subtitle="Ảnh 1200×500 (khuyến nghị). Có thể dùng sort để sắp xếp."
        onClose={onClose}
        wide
      >
        <form className="ad-form" onSubmit={this.btnSave}>
          <div className="ad-form__grid">
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-slide-title">
                Tiêu đề
              </label>
              <input
                id="ad-slide-title"
                className="ad-form__input"
                type="text"
                value={this.state.txtTitle}
                onChange={(e) =>
                  this.setState({ txtTitle: e.target.value, notice: null })
                }
              />
            </div>
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-slide-sort">
                Sort
              </label>
              <input
                id="ad-slide-sort"
                className="ad-form__input"
                type="number"
                value={this.state.txtSort}
                onChange={(e) =>
                  this.setState({ txtSort: e.target.value, notice: null })
                }
              />
            </div>
            <div className="ad-form__group ad-form__group--full">
              <label className="ad-form__label" htmlFor="ad-slide-subtitle">
                Mô tả
              </label>
              <input
                id="ad-slide-subtitle"
                className="ad-form__input"
                type="text"
                value={this.state.txtSubtitle}
                onChange={(e) =>
                  this.setState({ txtSubtitle: e.target.value, notice: null })
                }
              />
            </div>
            <div className="ad-form__group ad-form__group--full">
              <label className="ad-form__label" htmlFor="ad-slide-href">
                Link (tuỳ chọn)
              </label>
              <input
                id="ad-slide-href"
                className="ad-form__input"
                type="text"
                placeholder="/product/search/gaming hoặc https://..."
                value={this.state.txtHref}
                onChange={(e) =>
                  this.setState({ txtHref: e.target.value, notice: null })
                }
              />
            </div>
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-slide-active">
                Hiển thị
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  id="ad-slide-active"
                  type="checkbox"
                  checked={this.state.chkActive}
                  onChange={(e) =>
                    this.setState({ chkActive: e.target.checked, notice: null })
                  }
                />
                Active
              </label>
            </div>
            <div className="ad-form__group">
              <label className="ad-form__label" htmlFor="ad-slide-img">
                Ảnh
              </label>
              <input
                id="ad-slide-img"
                className="ad-form__file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={this.previewImage}
              />
            </div>
          </div>

          {this.state.imgSlide ? (
            <img
              className="ad-preview-img"
              src={this.state.imgSlide}
              alt="Xem trước slide"
              style={{ aspectRatio: '12 / 5', objectFit: 'cover' }}
            />
          ) : null}

          {this.state.notice ? (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 12,
                background:
                  this.state.notice.type === 'error'
                    ? 'rgba(220,38,38,0.10)'
                    : 'rgba(22,163,74,0.10)',
                border:
                  this.state.notice.type === 'error'
                    ? '1px solid rgba(220,38,38,0.25)'
                    : '1px solid rgba(22,163,74,0.25)',
                color: this.state.notice.type === 'error' ? '#991b1b' : '#166534',
                fontSize: '0.92rem',
              }}
            >
              {this.state.notice.text}
            </div>
          ) : null}

          <div className="ad-form__actions">
            <button type="submit" className="ad-btn ad-btn--primary">
              {isEdit ? 'Lưu' : 'Thêm'}
            </button>
            {isEdit ? (
              <button
                type="button"
                className="ad-btn ad-btn--danger"
                onClick={this.btnDelete}
              >
                Xoá
              </button>
            ) : null}
            <button type="button" className="ad-btn ad-btn--ghost" onClick={onClose}>
              Đóng
            </button>
          </div>
        </form>
      </AdminModal>
    );
  }
}

export default SlideDetail;

