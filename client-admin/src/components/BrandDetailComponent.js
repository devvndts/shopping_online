import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';
import { notifyPromise } from '../utils/notify';

class BrandDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: '',
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
    if (this.props.mode === 'edit' && this.props.item) {
      this.setState({
        txtID: this.props.item._id,
        txtName: this.props.item.name || '',
        notice: null,
      });
    } else {
      this.setState({
        txtID: '',
        txtName: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  apiGetBrands() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/brands', config).then((res) => {
      this.props.updateBrands(res.data || []);
    });
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = (this.state.txtName || '').trim();
    if (!name) {
      this.setNotice('error', 'Vui lòng nhập tên thương hiệu.');
      return;
    }
    this.setNotice(null);
    this.apiPostBrand({ name });
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = (this.state.txtName || '').trim();
    if (!id || !name) {
      this.setNotice('error', 'Thiếu ID hoặc tên thương hiệu.');
      return;
    }
    this.setNotice(null);
    this.apiPutBrand(id, { name });
  }

  btnDeleteClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    if (!id) {
      this.setNotice('error', 'Không có thương hiệu để xoá.');
      return;
    }
    if (
      !window.confirm(
        'Xoá thương hiệu này? Sản phẩm đã gán vẫn giữ text brand cũ.'
      )
    ) {
      return;
    }
    this.setNotice(null);
    this.apiDeleteBrand(id);
  }

  apiPostBrand(body) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .post('/api/admin/brands', body, config)
      .then((res) => {
        if (res.data) {
          this.apiGetBrands();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Thêm thương hiệu thất bại.');
        }
      })
      .catch((err) => {
        const msg =
          err.response &&
          err.response.data &&
          err.response.data.message
            ? err.response.data.message
            : 'Lỗi khi thêm thương hiệu.';
        this.setNotice('error', msg);
      });
  }

  apiPutBrand(id, body) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.put('/api/admin/brands/' + id, body, config).then((res) => {
      if (!res.data) throw new Error('Cập nhật thất bại.');
      this.apiGetBrands();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang cập nhật thương hiệu…',
      success: 'Đã cập nhật thương hiệu.',
      error: 'Cập nhật thương hiệu thất bại.',
    });
  }

  apiDeleteBrand(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.delete('/api/admin/brands/' + id, config).then((res) => {
      if (!res.data) throw new Error('Xoá thất bại.');
      this.apiGetBrands();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang xoá thương hiệu…',
      success: 'Đã xoá thương hiệu.',
      error: 'Xoá thương hiệu thất bại.',
    });
  }

  render() {
    const { isOpen, mode, onClose } = this.props;
    const { notice } = this.state;
    const isEdit = mode === 'edit';

    return (
      <AdminModal
        isOpen={isOpen}
        title={isEdit ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
        subtitle={
          isEdit
            ? 'Cập nhật tên hoặc xoá khỏi danh sách chọn nhanh.'
            : 'Tên hiển thị khi chọn brand cho sản phẩm.'
        }
        onClose={onClose}
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
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-brand-id">
              ID
            </label>
            <input
              id="ad-brand-id"
              className="ad-form__input"
              type="text"
              value={this.state.txtID}
              disabled
              readOnly
              placeholder="—"
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-brand-name">
              Tên thương hiệu
            </label>
            <input
              id="ad-brand-name"
              className="ad-form__input"
              type="text"
              value={this.state.txtName}
              onChange={(e) =>
                this.setState({ txtName: e.target.value, notice: null })
              }
              placeholder="VD: ASUS, Dell…"
              autoFocus={!isEdit}
            />
          </div>
          <div className="ad-form__actions">
            {!isEdit ? (
              <>
                <button
                  type="button"
                  className="ad-btn ad-btn--primary"
                  onClick={(e) => this.btnAddClick(e)}
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
                  onClick={(e) => this.btnUpdateClick(e)}
                >
                  Cập nhật
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn--danger"
                  onClick={(e) => this.btnDeleteClick(e)}
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

export default BrandDetail;
