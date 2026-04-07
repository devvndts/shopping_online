import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';

function stripBase64DataUrl(raw) {
  if (!raw) return '';
  return String(raw).replace(/^data:image\/[a-z]+;base64,/i, '');
}

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: '',
      txtDescription: '',
      cmbCategory: '',
      imgProduct: '',
      notice: null,
    };
  }

  componentDidMount() {
    this.apiGetCategories();
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
    if (
      this.props.isOpen &&
      this.props.mode === 'create' &&
      this.state.categories.length > 0 &&
      !this.state.cmbCategory
    ) {
      this.setState({ cmbCategory: this.state.categories[0]._id });
    }
  }

  syncFormFromProps() {
    if (this.props.mode === 'edit' && this.props.item) {
      const it = this.props.item;
      this.setState({
        txtID: it._id,
        txtName: it.name || '',
        txtPrice: String(it.price ?? ''),
        txtDescription: it.description || '',
        cmbCategory: it.category && it.category._id ? it.category._id : '',
        imgProduct: it.image ? 'data:image/jpg;base64,' + it.image : '',
        notice: null,
      });
    } else {
      const first =
        this.state.categories.length > 0 ? this.state.categories[0]._id : '';
      this.setState({
        txtID: '',
        txtName: '',
        txtPrice: '',
        txtDescription: '',
        cmbCategory: first,
        imgProduct: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = (this.state.txtName || '').trim();
    const price = parseInt(this.state.txtPrice, 10);
    const category = this.state.cmbCategory;
    const image = stripBase64DataUrl(this.state.imgProduct);
    const description = (this.state.txtDescription || '').trim();

    if (!name || !price || !category || !image) {
      this.setNotice(
        'error',
        'Điền đủ tên, giá, chọn danh mục và tải ảnh (JPEG/PNG/GIF).'
      );
      return;
    }
    this.setNotice(null);
    this.apiPostProduct({ name, price, category, image, description });
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = (this.state.txtName || '').trim();
    const price = parseInt(this.state.txtPrice, 10);
    const category = this.state.cmbCategory;
    const image = stripBase64DataUrl(this.state.imgProduct);
    const description = (this.state.txtDescription || '').trim();

    if (!id || !name || !price || !category || !image) {
      this.setNotice(
        'error',
        'Điền đủ thông tin và ảnh (giữ ảnh cũ nếu không đổi file).'
      );
      return;
    }
    this.setNotice(null);
    this.apiPutProduct(id, { name, price, category, image, description });
  }

  btnDeleteClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    if (!id) {
      this.setNotice('error', 'Không có sản phẩm để xoá.');
      return;
    }
    if (!window.confirm('Xoá sản phẩm này? Thao tác không thể hoàn tác.')) {
      return;
    }
    this.setNotice(null);
    this.apiDeleteProduct(id);
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const list = res.data || [];
      this.setState((s) => {
        const cur = s.cmbCategory;
        const stillValid =
          cur && list.some((c) => String(c._id) === String(cur));
        return {
          categories: list,
          cmbCategory: stillValid ? cur : list[0]?._id || '',
        };
      });
    });
  }

  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .post('/api/admin/products', prod, config)
      .then((res) => {
        if (res.data) {
          this.apiGetProducts();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Thêm sản phẩm thất bại.');
        }
      })
      .catch(() => this.setNotice('error', 'Lỗi kết nối khi thêm.'));
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .delete('/api/admin/products/' + id, config)
      .then((res) => {
        if (res.data) {
          this.apiGetProducts();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Xoá thất bại.');
        }
      })
      .catch(() => this.setNotice('error', 'Lỗi kết nối khi xoá.'));
  }

  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    const page = this.props.curPage || 1;
    axios
      .get('/api/admin/products?page=' + page, config)
      .then((res) => {
        const result = res.data || {};
        const list = result.products || [];
        if (list.length > 0) {
          this.props.updateProducts(list, result.noPages, result.curPage);
        } else if (page > 1) {
          axios
            .get('/api/admin/products?page=' + (page - 1), config)
            .then((r2) => {
              const r = r2.data || {};
              this.props.updateProducts(r.products || [], r.noPages, r.curPage);
            });
        } else {
          this.props.updateProducts([], result.noPages, result.curPage);
        }
      });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .put('/api/admin/products/' + id, prod, config)
      .then((res) => {
        if (res.data) {
          this.apiGetProducts();
          this.props.onClose();
        } else {
          this.setNotice('error', 'Cập nhật thất bại.');
        }
      })
      .catch(() => this.setNotice('error', 'Lỗi kết nối khi cập nhật.'));
  }

  render() {
    const { isOpen, mode, onClose } = this.props;
    const { categories, notice, cmbCategory } = this.state;
    const isEdit = mode === 'edit';

    return (
      <AdminModal
        isOpen={isOpen}
        wide
        title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        subtitle={
          isEdit
            ? 'Cập nhật thông tin, ảnh hoặc xoá sản phẩm.'
            : 'Điền đủ trường và chọn ảnh đại diện.'
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
            <label className="ad-form__label" htmlFor="ad-prod-id">
              ID
            </label>
            <input
              id="ad-prod-id"
              className="ad-form__input"
              type="text"
              value={this.state.txtID}
              readOnly
              disabled
              placeholder="—"
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-prod-name">
              Tên sản phẩm
            </label>
            <input
              id="ad-prod-name"
              className="ad-form__input"
              type="text"
              value={this.state.txtName}
              onChange={(e) =>
                this.setState({ txtName: e.target.value, notice: null })
              }
              autoFocus={!isEdit}
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-prod-price">
              Giá (VNĐ)
            </label>
            <input
              id="ad-prod-price"
              className="ad-form__input"
              type="number"
              min="0"
              value={this.state.txtPrice}
              onChange={(e) =>
                this.setState({ txtPrice: e.target.value, notice: null })
              }
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-prod-desc">
              Mô tả / thông tin chi tiết
            </label>
            <textarea
              id="ad-prod-desc"
              className="ad-form__textarea"
              rows={5}
              value={this.state.txtDescription}
              onChange={(e) =>
                this.setState({ txtDescription: e.target.value, notice: null })
              }
              placeholder="Nhập mô tả sản phẩm, cấu hình, bảo hành…"
            />
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-prod-cat">
              Danh mục
            </label>
            <select
              id="ad-prod-cat"
              className="ad-form__select"
              value={cmbCategory}
              onChange={(e) =>
                this.setState({
                  cmbCategory: e.target.value,
                  notice: null,
                })
              }
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ad-form__group">
            <label className="ad-form__label" htmlFor="ad-prod-img">
              Ảnh
            </label>
            <input
              id="ad-prod-img"
              className="ad-form__file"
              type="file"
              name="fileImage"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => this.previewImage(e)}
            />
          </div>

          {this.state.imgProduct ? (
            <img
              className="ad-preview-img"
              src={this.state.imgProduct}
              alt="Xem trước"
            />
          ) : null}

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

export default ProductDetail;
