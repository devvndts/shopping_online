import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';

class CustomerDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: '',
      chkActive: true,
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
      const it = this.props.item;
      this.setState({
        txtID: it._id,
        txtUsername: it.username || '',
        txtPassword: '',
        txtName: it.name || '',
        txtPhone: it.phone || '',
        txtEmail: it.email || '',
        chkActive: it.active === 1 || it.active === true,
        notice: null,
      });
    } else {
      this.setState({
        txtID: '',
        txtUsername: '',
        txtPassword: '',
        txtName: '',
        txtPhone: '',
        txtEmail: '',
        chkActive: true,
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  apiGetCustomers() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/customers', config).then((res) => {
      this.props.updateCustomers(res.data || []);
    });
  }

  errMessage(err, fallback) {
    const d = err.response && err.response.data;
    if (d && d.message) return d.message;
    return fallback;
  }

  btnAddClick(e) {
    e.preventDefault();
    const username = (this.state.txtUsername || '').trim();
    const password = (this.state.txtPassword || '').trim();
    const name = (this.state.txtName || '').trim();
    const phone = (this.state.txtPhone || '').trim();
    const email = (this.state.txtEmail || '').trim();
    if (!username || !password || !name || !phone || !email) {
      this.setNotice('error', 'Vui lòng nhập đủ các trường bắt buộc (kể cả mật khẩu).');
      return;
    }
    this.setNotice(null);
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .post(
        '/api/admin/customers',
        {
          username,
          password,
          name,
          phone,
          email,
          active: this.state.chkActive ? 1 : 0,
        },
        config
      )
      .then((res) => {
        if (res.data && res.data._id) {
          this.apiGetCustomers();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Thêm khách hàng thất bại.');
        }
      })
      .catch((err) =>
        this.setNotice(
          'error',
          this.errMessage(err, 'Lỗi kết nối khi thêm khách hàng.')
        )
      );
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const username = (this.state.txtUsername || '').trim();
    const name = (this.state.txtName || '').trim();
    const phone = (this.state.txtPhone || '').trim();
    const email = (this.state.txtEmail || '').trim();
    if (!id || !username || !name || !phone || !email) {
      this.setNotice('error', 'Thiếu thông tin bắt buộc.');
      return;
    }
    this.setNotice(null);
    const config = { headers: { 'x-access-token': this.context.token } };
    const body = {
      username,
      name,
      phone,
      email,
      active: this.state.chkActive ? 1 : 0,
    };
    const pwd = (this.state.txtPassword || '').trim();
    if (pwd) body.password = pwd;

    axios
      .put('/api/admin/customers/' + id, body, config)
      .then((res) => {
        if (res.data && res.data._id) {
          this.apiGetCustomers();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Cập nhật thất bại.');
        }
      })
      .catch((err) =>
        this.setNotice(
          'error',
          this.errMessage(err, 'Lỗi kết nối khi cập nhật.')
        )
      );
  }

  btnDeleteClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    if (!id) {
      this.setNotice('error', 'Không có khách hàng để xoá.');
      return;
    }
    if (
      !window.confirm(
        'Xoá tài khoản khách hàng này? Hành động không thể hoàn tác.'
      )
    ) {
      return;
    }
    this.setNotice(null);
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .delete('/api/admin/customers/' + id, config)
      .then((res) => {
        if (res.data && res.data._id) {
          this.apiGetCustomers();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Xoá thất bại.');
        }
      })
      .catch((err) =>
        this.setNotice('error', this.errMessage(err, 'Lỗi kết nối khi xoá.'))
      );
  }

  render() {
    const { isOpen, mode, onClose } = this.props;
    const { notice } = this.state;
    const isEdit = mode === 'edit';

    return (
      <AdminModal
        isOpen={isOpen}
        wide
        title={isEdit ? 'Sửa khách hàng' : 'Thêm khách hàng'}
        subtitle={
          isEdit
            ? 'Để trống mật khẩu nếu không đổi. Có thể bật/tắt kích hoạt tài khoản.'
            : 'Tạo tài khoản mới (có thể đăng nhập ngay nếu bật kích hoạt).'
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
            <label className="ad-form__label" htmlFor="ad-cust-id">
              ID
            </label>
            <input
              id="ad-cust-id"
              className="ad-form__input"
              type="text"
              value={this.state.txtID}
              disabled
              readOnly
              placeholder="—"
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cust-user">
              Tên đăng nhập
            </label>
            <input
              id="ad-cust-user"
              className="ad-form__input"
              type="text"
              value={this.state.txtUsername}
              onChange={(e) =>
                this.setState({ txtUsername: e.target.value, notice: null })
              }
              placeholder="username"
              autoFocus={!isEdit}
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cust-pwd">
              Mật khẩu
            </label>
            <input
              id="ad-cust-pwd"
              className="ad-form__input"
              type="password"
              value={this.state.txtPassword}
              onChange={(e) =>
                this.setState({ txtPassword: e.target.value, notice: null })
              }
              placeholder={
                isEdit ? 'Để trống để giữ mật khẩu hiện tại' : 'Bắt buộc khi thêm mới'
              }
              autoComplete="new-password"
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cust-name">
              Họ tên
            </label>
            <input
              id="ad-cust-name"
              className="ad-form__input"
              type="text"
              value={this.state.txtName}
              onChange={(e) =>
                this.setState({ txtName: e.target.value, notice: null })
              }
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cust-phone">
              Điện thoại
            </label>
            <input
              id="ad-cust-phone"
              className="ad-form__input"
              type="text"
              value={this.state.txtPhone}
              onChange={(e) =>
                this.setState({ txtPhone: e.target.value, notice: null })
              }
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-cust-email">
              Email
            </label>
            <input
              id="ad-cust-email"
              className="ad-form__input"
              type="email"
              value={this.state.txtEmail}
              onChange={(e) =>
                this.setState({ txtEmail: e.target.value, notice: null })
              }
            />
          </div>
          <div className="ad-form__group">
            <span className="ad-form__label">Kích hoạt</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <input
                id="ad-cust-active"
                type="checkbox"
                checked={this.state.chkActive}
                onChange={(e) =>
                  this.setState({ chkActive: e.target.checked, notice: null })
                }
              />
              <label htmlFor="ad-cust-active" style={{ cursor: 'pointer', margin: 0 }}>
                Cho phép đăng nhập (tài khoản đang hoạt động)
              </label>
            </div>
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

export default CustomerDetail;
