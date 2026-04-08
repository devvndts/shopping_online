import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';
import { notifyPromise, notifyWarning } from '../utils/notify';

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
      slideImageFile: null,
      manualImageUrl: '',
      notice: null,
    };
    this._imgObjectUrl = null;
  }

  componentWillUnmount() {
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
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
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
    if (item) {
      const thumb = (item.thumbUrl || '').trim() || (item.imageUrl || '').trim();
      const im = (item.imageUrl || '').trim();
      this.setState({
        txtID: item._id || '',
        txtTitle: item.title || '',
        txtSubtitle: item.subtitle || '',
        txtHref: item.href || '',
        txtSort: String(item.sort ?? 0),
        chkActive: item.active === 1,
        imgSlide: thumb,
        slideImageFile: null,
        manualImageUrl: /^https?:\/\//i.test(im) ? im : '',
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
        slideImageFile: null,
        manualImageUrl: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  onManualImageUrlChange = (e) => {
    const v = (e.target.value || '').trim();
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
    const show = /^https?:\/\//i.test(v) ? v : '';
    this.setState({
      manualImageUrl: e.target.value,
      slideImageFile: null,
      imgSlide: show,
      notice: null,
    });
  };

  previewImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      this.setNotice('error', 'Vui lòng chọn file ảnh.');
      return;
    }
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
    this._imgObjectUrl = URL.createObjectURL(file);
    this.setState({
      imgSlide: this._imgObjectUrl,
      slideImageFile: file,
      manualImageUrl: '',
      notice: null,
    });
  };

  btnSave = (e) => {
    e.preventDefault();
    const { onClose, onSaved, item } = this.props;
    const isEdit = !!this.state.txtID;

    const title = (this.state.txtTitle || '').trim();
    const subtitle = (this.state.txtSubtitle || '').trim();
    const href = (this.state.txtHref || '').trim();
    const sort = parseInt(this.state.txtSort, 10) || 0;
    const active = this.state.chkActive ? 1 : 0;
    const urlOpt = (this.state.manualImageUrl || '').trim();
    const hasFile = !!this.state.slideImageFile;
    const hasUrl = /^https?:\/\//i.test(urlOpt);
    const hadImg = !!(
      item &&
      ((item.thumbUrl || '').trim() || (item.imageUrl || '').trim())
    );

    if (!isEdit && !hasFile && !hasUrl) {
      this.setNotice('error', 'Chọn file ảnh hoặc nhập URL https.');
      notifyWarning('Chọn file ảnh hoặc nhập URL https.');
      return;
    }
    if (isEdit && !hasFile && !hasUrl && !hadImg) {
      this.setNotice('error', 'Slide cần có ảnh.');
      notifyWarning('Slide cần có ảnh.');
      return;
    }

    const fd = new FormData();
    fd.append('title', title);
    fd.append('subtitle', subtitle);
    fd.append('href', href);
    fd.append('sort', String(sort));
    fd.append('active', String(active));
    if (hasFile) {
      fd.append('image', this.state.slideImageFile);
    } else if (hasUrl) {
      fd.append('imageUrl', urlOpt);
    }

    const config = { headers: { 'x-access-token': this.context.token } };
    const req = (isEdit
      ? axios.put('/api/admin/slides/' + this.state.txtID, fd, config)
      : axios.post('/api/admin/slides', fd, config)
    ).then(() => {
      if (onSaved) onSaved();
      if (onClose) onClose();
    });
    notifyPromise(req, {
      pending: isEdit ? 'Đang lưu slide…' : 'Đang tạo slide & tải ảnh…',
      success: isEdit ? 'Đã lưu slide.' : 'Đã tạo slide.',
      error: 'Lưu slide thất bại.',
    });
  };

  btnDelete = (e) => {
    e.preventDefault();
    const { onClose, onSaved } = this.props;
    const id = this.state.txtID;
    if (!id) return;
    if (!window.confirm('Xoá slide này?')) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.delete('/api/admin/slides/' + id, config).then(() => {
      if (onSaved) onSaved();
      if (onClose) onClose();
    });
    notifyPromise(p, {
      pending: 'Đang xoá slide…',
      success: 'Đã xoá slide.',
      error: 'Xoá slide thất bại.',
    });
  };

  render() {
    const { open, onClose } = this.props;
    const { notice, imgSlide, txtID } = this.state;

    return (
      <AdminModal
        isOpen={!!open}
        title={this.state.txtID ? 'Sửa slide' : 'Thêm slide'}
        subtitle="Ảnh: upload file hoặc URL https — lưu DB chỉ là link Firebase."
        onClose={onClose}
      >
        {notice ? (
          <div
            className={notice.type === 'error' ? 'ad-alert ad-alert--error' : 'ad-alert ad-alert--success'}
            role="status"
          >
            {notice.text}
          </div>
        ) : null}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="ad-form__group">
            <label className="ad-form__label">Tiêu đề</label>
            <input
              className="ad-form__input"
              value={this.state.txtTitle}
              onChange={(e) => this.setState({ txtTitle: e.target.value })}
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label">Phụ đề</label>
            <input
              className="ad-form__input"
              value={this.state.txtSubtitle}
              onChange={(e) => this.setState({ txtSubtitle: e.target.value })}
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label">Link (pathname hoặc https)</label>
            <input
              className="ad-form__input"
              value={this.state.txtHref}
              onChange={(e) => this.setState({ txtHref: e.target.value })}
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label">Sort</label>
            <input
              className="ad-form__input"
              type="number"
              value={this.state.txtSort}
              onChange={(e) => this.setState({ txtSort: e.target.value })}
            />
          </div>
          <div className="ad-form__group">
            <label>
              <input
                type="checkbox"
                checked={this.state.chkActive}
                onChange={(e) => this.setState({ chkActive: e.target.checked })}
              />{' '}
              Hiển thị
            </label>
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label">Ảnh slide</label>
            <input
              className="ad-form__file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={this.previewImage}
            />
            <label className="ad-form__label" style={{ marginTop: 10 }}>
              Hoặc URL https
            </label>
            <input
              className="ad-form__input"
              type="url"
              value={this.state.manualImageUrl}
              onChange={this.onManualImageUrlChange}
              placeholder="https://"
            />
          </div>
          {imgSlide ? (
            <div style={{ marginTop: 12 }}>
              <img
                src={imgSlide}
                alt=""
                style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 8 }}
              />
            </div>
          ) : null}

          <div className="ad-form__actions" style={{ marginTop: 18 }}>
            <button type="button" className="ad-btn ad-btn--primary" onClick={this.btnSave}>
              Lưu
            </button>
            {txtID ? (
              <button type="button" className="ad-btn ad-btn--danger" onClick={this.btnDelete}>
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
