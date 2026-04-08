import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { notifyPromise, notifyWarning } from '../utils/notify';
import AdminModal from './AdminModal';

function clampStars(n) {
  const x = parseInt(n, 10);
  if (Number.isNaN(x)) return 5;
  return Math.min(5, Math.max(1, x));
}

class ReviewDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loadingProducts: false,
      txtID: '',
      cmbProductId: '',
      txtProductName: '',
      txtAuthor: '',
      txtStars: 5,
      txtContent: '',
      chkActive: true,
      notice: null,
    };
  }

  componentDidMount() {
    this.apiLoadProducts();
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

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  apiLoadProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    this.setState({ loadingProducts: true });
    axios
      .get('/api/admin/products/all', config)
      .then((res) => {
        const list = res.data || [];
        this.setState((s) => {
          const cur = s.cmbProductId;
          const stillValid = cur && list.some((p) => String(p._id) === String(cur));
          const nextId = stillValid ? cur : list[0]?._id || '';
          const nextName =
            list.find((p) => String(p._id) === String(nextId))?.name || '';
          return {
            products: list,
            cmbProductId: nextId,
            txtProductName: s.txtProductName || nextName,
            loadingProducts: false,
          };
        });
      })
      .catch(() => {
        this.setState({ products: [], loadingProducts: false });
        notifyWarning('Không tải được danh sách sản phẩm (vẫn có thể nhập tay).');
      });
  }

  syncFormFromProps() {
    if (this.props.mode === 'edit' && this.props.item) {
      const it = this.props.item;
      this.setState({
        txtID: it._id || '',
        cmbProductId: it.productId || '',
        txtProductName: it.productName || '',
        txtAuthor: it.author || '',
        txtStars: clampStars(it.stars),
        txtContent: it.content || '',
        chkActive: it.active === 1,
        notice: null,
      });
    } else {
      const firstId = this.state.products[0]?._id || '';
      const firstName = this.state.products[0]?.name || '';
      this.setState({
        txtID: '',
        cmbProductId: firstId,
        txtProductName: firstName,
        txtAuthor: '',
        txtStars: 5,
        txtContent: '',
        chkActive: true,
        notice: null,
      });
    }
  }

  onProductChange(productId) {
    const pid = String(productId || '');
    const name = this.state.products.find((p) => String(p._id) === pid)?.name || '';
    this.setState({ cmbProductId: pid, txtProductName: name, notice: null });
  }

  validate() {
    const productId = (this.state.cmbProductId || '').trim();
    const productName = (this.state.txtProductName || '').trim();
    const author = (this.state.txtAuthor || '').trim();
    const content = (this.state.txtContent || '').trim();
    const stars = clampStars(this.state.txtStars);
    if (!productId || !productName || !author || !content) {
      this.setNotice('error', 'Vui lòng chọn sản phẩm, nhập người đánh giá và nội dung.');
      return null;
    }
    return {
      productId,
      productName,
      author,
      stars,
      content,
      active: this.state.chkActive ? 1 : 0,
    };
  }

  save = () => {
    const payload = this.validate();
    if (!payload) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    if (this.props.mode === 'edit') {
      const p = axios
        .put('/api/admin/reviews/' + this.state.txtID, payload, config)
        .then(() => {
          this.props.onClose();
        });
      notifyPromise(p, {
        pending: 'Đang cập nhật đánh giá…',
        success: 'Đã cập nhật đánh giá.',
        error: 'Cập nhật đánh giá thất bại.',
      });
    } else {
      const p = axios.post('/api/admin/reviews', payload, config).then(() => {
        this.props.onClose();
      });
      notifyPromise(p, {
        pending: 'Đang thêm đánh giá…',
        success: 'Đã thêm đánh giá.',
        error: 'Thêm đánh giá thất bại.',
      });
    }
  };

  render() {
    const { isOpen, mode, onClose } = this.props;
    const isEdit = mode === 'edit';
    const { notice, products, loadingProducts } = this.state;

    return (
      <AdminModal
        isOpen={isOpen}
        wide
        title={isEdit ? 'Sửa đánh giá' : 'Thêm đánh giá'}
        subtitle="Đánh giá hiển thị ở trang chi tiết sản phẩm (tab Đánh giá)."
        onClose={onClose}
      >
        {notice ? (
          <div
            className={
              'ad-alert' + (notice.type === 'success' ? ' ad-alert--success' : ' ad-alert--error')
            }
            role="status"
          >
            {notice.text}
          </div>
        ) : null}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-rev-id">
              ID
            </label>
            <input
              id="ad-rev-id"
              className="ad-form__input"
              type="text"
              value={this.state.txtID}
              readOnly
              disabled
              placeholder="—"
            />
          </div>

          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-rev-product">
              Sản phẩm {loadingProducts ? '(đang tải…)': ''}
            </label>
            {products && products.length > 0 ? (
              <select
                id="ad-rev-product"
                className="ad-form__select"
                value={this.state.cmbProductId}
                onChange={(e) => this.onProductChange(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="ad-rev-product"
                className="ad-form__input"
                type="text"
                value={this.state.cmbProductId}
                onChange={(e) => this.setState({ cmbProductId: e.target.value, notice: null })}
                placeholder="Nhập Product ID…"
              />
            )}
          </div>

          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-rev-productName">
              Tên sản phẩm
            </label>
            <input
              id="ad-rev-productName"
              className="ad-form__input"
              type="text"
              value={this.state.txtProductName}
              onChange={(e) => this.setState({ txtProductName: e.target.value, notice: null })}
              placeholder="Tự điền theo select (có thể sửa tay)."
            />
          </div>

          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-rev-author">
              Người đánh giá
            </label>
            <input
              id="ad-rev-author"
              className="ad-form__input"
              type="text"
              value={this.state.txtAuthor}
              onChange={(e) => this.setState({ txtAuthor: e.target.value, notice: null })}
              placeholder="Ví dụ: Cường"
              autoFocus={!isEdit}
            />
          </div>

          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-rev-stars">
              Số sao (1–5)
            </label>
            <input
              id="ad-rev-stars"
              className="ad-form__input"
              type="number"
              min="1"
              max="5"
              value={this.state.txtStars}
              onChange={(e) => this.setState({ txtStars: clampStars(e.target.value), notice: null })}
            />
          </div>

          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-rev-content">
              Nội dung
            </label>
            <textarea
              id="ad-rev-content"
              className="ad-form__textarea"
              rows={5}
              value={this.state.txtContent}
              onChange={(e) => this.setState({ txtContent: e.target.value, notice: null })}
              placeholder="Viết trải nghiệm/nhận xét…"
            />
          </div>

          <div className="ad-form__group">
            <label className="ad-form__label">
              Hiển thị
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                checked={this.state.chkActive}
                onChange={(e) => this.setState({ chkActive: e.target.checked, notice: null })}
              />
              Bật hiển thị ở client-customer
            </label>
          </div>

          <div className="ad-form__actions">
            <button type="button" className="ad-btn ad-btn--primary" onClick={this.save}>
              {isEdit ? 'Lưu thay đổi' : 'Tạo đánh giá'}
            </button>
            <button type="button" className="ad-btn ad-btn--ghost" onClick={onClose}>
              Huỷ
            </button>
          </div>
        </form>
      </AdminModal>
    );
  }
}

export default ReviewDetail;

