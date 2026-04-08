import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import AdminModal from './AdminModal';
import { notifyPromise } from '../utils/notify';

const AD_GALLERY_MAX = 12;

function imagePreviewFromStored(image) {
  if (!image) return '';
  const s = String(image).trim();
  if (/^https?:\/\//i.test(s)) return s;
  // Legacy DB: chuỗi base64 thuần (không gửi base64 lên API nữa)
  return 'data:image/jpeg;base64,' + s;
}

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      brands: [],
      txtID: '',
      txtName: '',
      txtSlug: '',
      txtBrand: '',
      txtNewBrandQuick: '',
      txtPrice: '',
      txtDescription: '',
      cmbCategory: '',
      imgProduct: '',
      imageFile: null,
      manualImageUrl: '',
      galleryItems: [],
      txtGalleryUrl: '',
      notice: null,
    };
    this._imgObjectUrl = null;
    this._galleryBlobUrls = [];
  }

  revokeGalleryBlobs() {
    (this._galleryBlobUrls || []).forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {
        /* ignore */
      }
    });
    this._galleryBlobUrls = [];
  }

  componentWillUnmount() {
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
    this.revokeGalleryBlobs();
  }

  componentDidMount() {
    this.apiGetCategories();
    this.apiGetBrands();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isOpen) return;
    const opened = !prevProps.isOpen && this.props.isOpen;
    if (opened) {
      this.apiGetBrands();
    }
    const itemChanged =
      this.props.mode === 'edit' &&
      this.props.item &&
      prevProps.item !== this.props.item;
    if (opened || itemChanged) {
      this.syncFormFromProps();
    }
    const cats = Array.isArray(this.state.categories)
      ? this.state.categories
      : [];
    if (
      this.props.isOpen &&
      this.props.mode === 'create' &&
      cats.length > 0 &&
      !this.state.cmbCategory
    ) {
      this.setState({ cmbCategory: cats[0]._id });
    }
  }

  syncFormFromProps() {
    if (this.props.mode === 'edit' && this.props.item) {
      const it = this.props.item;
      const im = it.image != null ? String(it.image).trim() : '';
      const rawGal = Array.isArray(it.gallery) ? it.gallery : [];
      this.revokeGalleryBlobs();
      const galleryItems = rawGal
        .filter(Boolean)
        .map((url) => {
          const u = String(url).trim();
          return {
            id: `u-${u.slice(-20)}-${Math.random().toString(36).slice(2, 9)}`,
            kind: 'url',
            url: u,
            preview: imagePreviewFromStored(u),
          };
        })
        .slice(0, AD_GALLERY_MAX);
      this.setState({
        txtID: it._id,
        txtName: it.name || '',
        txtSlug: it.slug != null ? String(it.slug) : '',
        txtBrand: it.brand != null ? String(it.brand) : '',
        txtPrice: String(it.price ?? ''),
        txtDescription: it.description || '',
        cmbCategory: it.category && it.category._id ? it.category._id : '',
        imgProduct: imagePreviewFromStored(it.image),
        imageFile: null,
        manualImageUrl: /^https?:\/\//i.test(im) ? im : '',
        galleryItems,
        txtGalleryUrl: '',
        notice: null,
      });
    } else {
      const cats = Array.isArray(this.state.categories)
        ? this.state.categories
        : [];
      const first = cats.length > 0 ? cats[0]._id : '';
      this.revokeGalleryBlobs();
      this.setState({
        txtID: '',
        txtName: '',
        txtSlug: '',
        txtBrand: '',
        txtNewBrandQuick: '',
        txtPrice: '',
        txtDescription: '',
        cmbCategory: first,
        imgProduct: '',
        imageFile: null,
        manualImageUrl: '',
        galleryItems: [],
        txtGalleryUrl: '',
        notice: null,
      });
    }
  }

  setNotice(type, text) {
    this.setState({ notice: type ? { type, text } : null });
  }

  previewImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!/^image\//i.test(file.type)) {
      this.setNotice('error', 'Chọn file ảnh (JPEG/PNG/GIF/WebP).');
      return;
    }
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
    this._imgObjectUrl = URL.createObjectURL(file);
    this.setState({
      imgProduct: this._imgObjectUrl,
      imageFile: file,
      manualImageUrl: '',
      notice: null,
    });
  }

  addGalleryFromUrlField(e) {
    e.preventDefault();
    const u = (this.state.txtGalleryUrl || '').trim();
    if (!/^https?:\/\//i.test(u)) {
      this.setNotice('error', 'Nhập URL gallery dạng https://...');
      return;
    }
    const cur = Array.isArray(this.state.galleryItems)
      ? this.state.galleryItems
      : [];
    if (cur.length >= AD_GALLERY_MAX) {
      this.setNotice('error', `Tối đa ${AD_GALLERY_MAX} ảnh phụ.`);
      return;
    }
    this.setState({
      galleryItems: [
        ...cur,
        {
          id: `u-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          kind: 'url',
          url: u,
          preview: u,
        },
      ],
      txtGalleryUrl: '',
      notice: null,
    });
  }

  onGalleryFilesChange(e) {
    const picked = Array.from(e.target.files || []).filter((f) =>
      /^image\//i.test(f.type),
    );
    if (!picked.length) return;
    const cur = Array.isArray(this.state.galleryItems)
      ? this.state.galleryItems
      : [];
    const room = AD_GALLERY_MAX - cur.length;
    if (room <= 0) {
      this.setNotice('error', `Tối đa ${AD_GALLERY_MAX} ảnh phụ.`);
      e.target.value = '';
      return;
    }
    const next = [...cur];
    if (!this._galleryBlobUrls) this._galleryBlobUrls = [];
    for (let i = 0; i < picked.length && next.length < AD_GALLERY_MAX; i++) {
      const file = picked[i];
      const blob = URL.createObjectURL(file);
      this._galleryBlobUrls.push(blob);
      next.push({
        id: `f-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        kind: 'file',
        file,
        preview: blob,
      });
    }
    this.setState({ galleryItems: next, notice: null });
    e.target.value = '';
  }

  removeGalleryItem(id) {
    const cur = Array.isArray(this.state.galleryItems)
      ? this.state.galleryItems
      : [];
    const it = cur.find((x) => x.id === id);
    if (it && it.kind === 'file' && it.preview && it.preview.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(it.preview);
      } catch {
        /* ignore */
      }
      this._galleryBlobUrls = (this._galleryBlobUrls || []).filter(
        (b) => b !== it.preview,
      );
    }
    this.setState({
      galleryItems: cur.filter((x) => x.id !== id),
    });
  }

  appendGalleryFormData(fd) {
    const urls = [];
    const files = [];
    const items = Array.isArray(this.state.galleryItems)
      ? this.state.galleryItems
      : [];
    for (const it of items) {
      if (it.kind === 'url' && it.url) urls.push(String(it.url).trim());
      if (it.kind === 'file' && it.file) files.push(it.file);
    }
    fd.append('galleryUrls', JSON.stringify(urls));
    for (const f of files) {
      fd.append('gallery', f);
    }
  }

  onManualImageUrlChange(e) {
    const v = (e.target.value || '').trim();
    if (this._imgObjectUrl) {
      URL.revokeObjectURL(this._imgObjectUrl);
      this._imgObjectUrl = null;
    }
    const show = /^https?:\/\//i.test(v) ? v : '';
    this.setState({
      manualImageUrl: e.target.value,
      imageFile: null,
      imgProduct: show,
      notice: null,
    });
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = (this.state.txtName || '').trim();
    const brand = (this.state.txtBrand || '').trim();
    const price = parseInt(this.state.txtPrice, 10);
    const category = this.state.cmbCategory;
    const description = (this.state.txtDescription || '').trim();
    const urlOpt = (this.state.manualImageUrl || '').trim();

    const hasFile = !!this.state.imageFile;
    const hasUrl = /^https?:\/\//i.test(urlOpt);
    if (!name || !price || !category || (!hasFile && !hasUrl)) {
      this.setNotice(
        'error',
        'Điền đủ tên, giá, danh mục; chọn file ảnh hoặc nhập URL https.'
      );
      return;
    }
    this.setNotice(null);
    this.apiPostProduct({ name, brand, price, category, description }, urlOpt);
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = (this.state.txtName || '').trim();
    const brand = (this.state.txtBrand || '').trim();
    const price = parseInt(this.state.txtPrice, 10);
    const category = this.state.cmbCategory;
    const description = (this.state.txtDescription || '').trim();
    const urlOpt = (this.state.manualImageUrl || '').trim();

    const hasFile = !!this.state.imageFile;
    const hasUrl = /^https?:\/\//i.test(urlOpt);
    const legacyPreview =
      (this.state.imgProduct || '').startsWith('data:') &&
      !hasFile &&
      !hasUrl;

    if (!id || !name || !price || !category) {
      this.setNotice('error', 'Điền đủ thông tin sản phẩm.');
      return;
    }
    if (!hasFile && !hasUrl && !legacyPreview && !this.state.imgProduct) {
      this.setNotice(
        'error',
        'Chọn ảnh mới, nhập URL https, hoặc giữ ảnh hiện tại.'
      );
      return;
    }
    this.setNotice(null);
    this.apiPutProduct(
      id,
      { name, brand, price, category, description },
      urlOpt
    );
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

  apiGetBrands() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/brands', config).then((res) => {
      this.setState({ brands: res.data || [] });
    });
  }

  btnQuickAddBrand(e) {
    e.preventDefault();
    const name = (this.state.txtNewBrandQuick || '').trim();
    if (!name) {
      this.setNotice('error', 'Nhập tên thương hiệu cần thêm.');
      return;
    }
    this.setNotice(null);
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.post('/api/admin/brands', { name }, config).then((res) => {
      if (!res.data) throw new Error('Không thêm được thương hiệu.');
      this.setState({
        txtNewBrandQuick: '',
        txtBrand: name,
        notice: null,
      });
      this.apiGetBrands();
    });
    notifyPromise(p, {
      pending: 'Đang thêm thương hiệu…',
      success: 'Đã thêm thương hiệu.',
      error: 'Không thêm được thương hiệu.',
    });
  }

  apiPostProduct(fields, imageUrlField) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const fd = new FormData();
    fd.append('name', fields.name);
    fd.append('brand', fields.brand || '');
    fd.append('price', String(fields.price));
    fd.append('category', fields.category);
    fd.append('description', fields.description || '');
    if (this.state.imageFile) {
      fd.append('image', this.state.imageFile);
    } else if (imageUrlField && /^https?:\/\//i.test(imageUrlField.trim())) {
      fd.append('imageUrl', imageUrlField.trim());
    }
    this.appendGalleryFormData(fd);
    const p = axios.post('/api/admin/products', fd, config).then((res) => {
      if (!res.data) throw new Error('Thêm sản phẩm thất bại.');
      this.apiGetProducts();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang tải lên sản phẩm…',
      success: 'Đã thêm sản phẩm.',
      error: 'Thêm sản phẩm thất bại.',
    });
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

  apiPutProduct(id, fields, imageUrlField) {
    const config = { headers: { 'x-access-token': this.context.token } };
    const fd = new FormData();
    fd.append('name', fields.name);
    fd.append('brand', fields.brand || '');
    fd.append('price', String(fields.price));
    fd.append('category', fields.category);
    fd.append('description', fields.description || '');
    if (this.state.imageFile) {
      fd.append('image', this.state.imageFile);
    } else if (imageUrlField && /^https?:\/\//i.test(imageUrlField.trim())) {
      fd.append('imageUrl', imageUrlField.trim());
    }
    this.appendGalleryFormData(fd);
    const p = axios.put('/api/admin/products/' + id, fd, config).then((res) => {
      if (!res.data) throw new Error('Cập nhật thất bại.');
      this.apiGetProducts();
      this.props.onClose();
    });
    notifyPromise(p, {
      pending: 'Đang cập nhật & tải ảnh…',
      success: 'Đã cập nhật sản phẩm.',
      error: 'Cập nhật sản phẩm thất bại.',
    });
  }

  render() {
    const { isOpen, mode, onClose } = this.props;
    const {
      notice,
      cmbCategory,
      txtBrand,
    } = this.state;
    const categories = Array.isArray(this.state.categories)
      ? this.state.categories
      : [];
    const brands = Array.isArray(this.state.brands) ? this.state.brands : [];
    const galleryItems = Array.isArray(this.state.galleryItems)
      ? this.state.galleryItems
      : [];
    const isEdit = mode === 'edit';
    const brandInList = brands.some((b) => b.name === txtBrand);

    return (
      <AdminModal
        isOpen={isOpen}
        extraWide
        title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        subtitle={
          isEdit
            ? 'Ảnh: chọn file mới, dán URL https, hoặc giữ nguyên.'
            : 'Ảnh: upload file hoặc dán URL https (lưu Mongo chỉ là link).'
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
          <div className="ad-prod-form-layout">
            {/* Media (ảnh bìa + gallery) */}
            <div className="ad-prod-form-layout__col ad-prod-form-layout__col--secondary">
              <div className="ad-form__group">
                <label className="ad-form__label" htmlFor="ad-prod-img">
                  Ảnh bìa 
                </label>
                <input
                  id="ad-prod-img"
                  className="ad-form__file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => this.previewImage(e)}
                />
                <label
                  className="ad-form__label"
                  htmlFor="ad-prod-imgurl"
                  style={{ marginTop: 12 }}
                >
                  Hoặc URL ảnh có sẵn (https://…)
                </label>
                <input
                  id="ad-prod-imgurl"
                  className="ad-form__input"
                  type="url"
                  value={this.state.manualImageUrl}
                  onChange={(e) => this.onManualImageUrlChange(e)}
                  placeholder="https://"
                  autoComplete="off"
                />
                {this.state.imgProduct ? (
                  <img
                    className="ad-preview-img"
                    src={this.state.imgProduct}
                    alt="Ảnh bìa xem trước"
                  />
                ) : (
                  <div className="ad-prod-media-placeholder">
                    Chưa có ảnh bìa. Hãy upload hoặc dán URL.
                  </div>
                )}
              </div>

              <div className="ad-form__group" style={{ marginTop: 16 }}>
                <label className="ad-form__label">
                  Gallery — ảnh phụ (tối đa {AD_GALLERY_MAX})
                </label>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--ad-muted)',
                    margin: '0 0 12px',
                    lineHeight: 1.45,
                  }}
                >
                  Gợi ý: thêm 3–6 ảnh (góc khác, cận cảnh) để trang chi tiết hiển thị đẹp hơn.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 10,
                    alignItems: 'center',
                  }}
                >
                  <input
                    className="ad-form__input"
                    type="url"
                    style={{ flex: '1 1 220px', minWidth: 0 }}
                    value={this.state.txtGalleryUrl}
                    onChange={(e) =>
                      this.setState({ txtGalleryUrl: e.target.value, notice: null })
                    }
                    placeholder="https://… (ảnh góc khác)"
                  />
                  <button
                    type="button"
                    className="ad-btn ad-btn--ghost"
                    onClick={(e) => this.addGalleryFromUrlField(e)}
                  >
                    Thêm URL
                  </button>
                </div>
                <input
                  className="ad-form__file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => this.onGalleryFilesChange(e)}
                />
                {galleryItems.length ? (
                  <div className="ad-prod-gallery-grid">
                    {galleryItems.map((it) => (
                      <div key={it.id} className="ad-prod-gallery-item">
                        <img src={it.preview} alt="" />
                        <button
                          type="button"
                          title="Xoá"
                          onClick={() => this.removeGalleryItem(it.id)}
                          className="ad-prod-gallery-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="ad-prod-form-layout__col">
              {isEdit && this.state.txtID ? (
                <p className="ad-prod-meta">
                  <span className="ad-prod-meta__label">ID</span>{' '}
                  <code className="ad-prod-meta__value">{this.state.txtID}</code>
                </p>
              ) : null}

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
                  autoFocus
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
                  placeholder="VD: 25990000"
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
                <label className="ad-form__label" htmlFor="ad-prod-brand">
                  Thương hiệu
                </label>
                <select
                  id="ad-prod-brand"
                  className="ad-form__select"
                  value={txtBrand}
                  onChange={(e) =>
                    this.setState({
                      txtBrand: e.target.value,
                      notice: null,
                    })
                  }
                >
                  <option value="">— Chọn thương hiệu —</option>
                  {!brandInList && txtBrand ? (
                    <option value={txtBrand}>
                      {txtBrand} (chưa có trong danh sách)
                    </option>
                  ) : null}
                  {brands.map((b) => (
                    <option key={b._id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="ad-brand-quick">
                  <input
                    className="ad-form__input"
                    type="text"
                    value={this.state.txtNewBrandQuick}
                    onChange={(e) =>
                      this.setState({
                        txtNewBrandQuick: e.target.value,
                        notice: null,
                      })
                    }
                    placeholder="Thêm nhanh thương hiệu mới…"
                    aria-label="Tên thương hiệu mới"
                  />
                  <button
                    type="button"
                    className="ad-btn ad-btn--ghost"
                    onClick={(e) => this.btnQuickAddBrand(e)}
                  >
                    Tạo và chọn
                  </button>
                </div>
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label" htmlFor="ad-prod-desc">
                  Mô tả / thông tin chi tiết
                </label>
                <textarea
                  id="ad-prod-desc"
                  className="ad-form__textarea"
                  rows={7}
                  value={this.state.txtDescription}
                  onChange={(e) =>
                    this.setState({
                      txtDescription: e.target.value,
                      notice: null,
                    })
                  }
                  placeholder="Nhập mô tả sản phẩm, cấu hình, bảo hành…"
                />
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label" htmlFor="ad-prod-slug">
                  Slug (URL công khai)
                </label>
                <input
                  id="ad-prod-slug"
                  className="ad-form__input"
                  type="text"
                  value={this.state.txtSlug}
                  readOnly
                  disabled
                  placeholder={
                    isEdit ? '' : 'Tự tạo khi lưu, ví dụ: laptop-asus-rog-...'
                  }
                />
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '0.78rem',
                    color: 'var(--ad-muted)',
                    lineHeight: 1.4,
                  }}
                >
                  Link: <code style={{ fontSize: '0.8em' }}>/product/{this.state.txtSlug || '…'}</code>
                  {!isEdit ? ' · Cập nhật theo tên mỗi lần lưu.' : null}
                </p>
              </div>
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

export default ProductDetail;
