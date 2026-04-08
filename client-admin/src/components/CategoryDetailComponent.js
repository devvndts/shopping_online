import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';
import { notifyPromise } from '../utils/notify';

class CategoryDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: '',
      txtSlug: '',
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
        txtSlug: this.props.item.slug != null ? String(this.props.item.slug) : '',
        notice: null,
      });
    } else {
      this.setState({
        txtID: '',
        txtName: '',
        txtSlug: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.props.updateCategories(res.data || []);
    });
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = (this.state.txtName || '').trim();
    if (!name) {
      this.setNotice('error', 'Vui lòng nhập tên danh mục.');
      return;
    }
    this.setNotice(null);
    this.apiPostCategory({ name });
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = (this.state.txtName || '').trim();
    if (!id || !name) {
      this.setNotice('error', 'Thiếu ID hoặc tên danh mục.');
      return;
    }
    this.setNotice(null);
    this.apiPutCategory(id, { name });
  }

  btnDeleteClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    if (!id) {
      this.setNotice('error', 'Không có danh mục để xoá.');
      return;
    }
    if (
      !window.confirm(
        'Xoá danh mục này? Hành động không thể hoàn tác (kiểm tra sản phẩm liên quan).'
      )
    ) {
      return;
    }
    this.setNotice(null);
    this.apiDeleteCategory(id);
  }

  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.post('/api/admin/categories', cate, config).then((res) => {
      if (!res.data) throw new Error('Thêm danh mục thất bại.');
      this.apiGetCategories();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang thêm danh mục…',
      success: 'Đã thêm danh mục.',
      error: 'Thêm danh mục thất bại.',
    });
  }

  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      if (!res.data) throw new Error('Cập nhật thất bại.');
      this.apiGetCategories();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang cập nhật danh mục…',
      success: 'Đã cập nhật danh mục.',
      error: 'Cập nhật danh mục thất bại.',
    });
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.delete('/api/admin/categories/' + id, config).then((res) => {
      if (!res.data) throw new Error('Xoá thất bại (có thể đang được sử dụng).');
      this.apiGetCategories();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang xoá danh mục…',
      success: 'Đã xoá danh mục.',
      error: 'Xoá danh mục thất bại.',
    });
  }

  render() {
    const { isOpen, mode, onClose } = this.props;
    const { notice } = this.state;
    const isEdit = mode === 'edit';

    return (
      <AdminModal
        isOpen={isOpen}
        title={isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}
        subtitle={
          isEdit
            ? 'Cập nhật tên hoặc xoá danh mục khỏi hệ thống.'
            : 'Nhập tên nhóm sản phẩm mới (VD: Laptop gaming).'
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
            <label className="ad-form__label" htmlFor="ad-cat-id">
              ID
            </label>
            <input
              id="ad-cat-id"
              className="ad-form__input"
              type="text"
              value={this.state.txtID}
              disabled
              readOnly
              placeholder="—"
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cat-name">
              Tên danh mục
            </label>
            <input
              id="ad-cat-name"
              className="ad-form__input"
              type="text"
              value={this.state.txtName}
              onChange={(e) =>
                this.setState({ txtName: e.target.value, notice: null })
              }
              placeholder="VD: Laptop gaming"
              autoFocus={!isEdit}
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cat-slug">
              Slug (URL cửa hàng)
            </label>
            <input
              id="ad-cat-slug"
              className="ad-form__input"
              type="text"
              value={this.state.txtSlug}
              readOnly
              disabled
              placeholder={isEdit ? '' : 'Tự tạo khi lưu'}
            />
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '0.78rem',
                color: 'var(--ad-muted)',
                lineHeight: 1.4,
              }}
            >
              Khách xem danh sách tại{' '}
              <code style={{ fontSize: '0.8em' }}>
                /product/category/{this.state.txtSlug || '…'}
              </code>
            </p>
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

export default CategoryDetail;
