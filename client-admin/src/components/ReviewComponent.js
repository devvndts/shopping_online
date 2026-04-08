import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { notifyError, notifyPromise } from '../utils/notify';
import ReviewDetail from './ReviewDetailComponent';

function starsText(n) {
  const x = Math.min(5, Math.max(1, parseInt(n, 10) || 5));
  return '★'.repeat(x) + '☆'.repeat(5 - x);
}

class Review extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      loading: true,
      modalOpen: false,
      modalMode: 'create', // create | edit
      activeItem: null,
    };
  }

  componentDidMount() {
    this.apiLoad();
  }

  apiLoad() {
    const config = { headers: { 'x-access-token': this.context.token } };
    this.setState({ loading: true });
    axios
      .get('/api/admin/reviews', config)
      .then((res) => this.setState({ items: res.data || [], loading: false }))
      .catch(() => {
        this.setState({ items: [], loading: false });
        notifyError('Tải đánh giá thất bại.');
      });
  }

  openCreate = () => {
    this.setState({ modalOpen: true, modalMode: 'create', activeItem: null });
  };

  openEdit = (item) => {
    this.setState({ modalOpen: true, modalMode: 'edit', activeItem: item });
  };

  closeModal = () => {
    this.setState({ modalOpen: false, activeItem: null });
  };

  toggleActive = (item) => {
    const config = { headers: { 'x-access-token': this.context.token } };
    const next = item.active === 1 ? 0 : 1;
    const p = axios
      .patch('/api/admin/reviews/' + item._id + '/active', { active: next }, config)
      .then(() => {
        this.apiLoad();
      });
    notifyPromise(p, {
      pending: 'Đang cập nhật trạng thái…',
      success: next ? 'Đã bật hiển thị.' : 'Đã tắt hiển thị.',
      error: 'Cập nhật trạng thái thất bại.',
    });
  };

  deleteItem = (item) => {
    // eslint-disable-next-line no-restricted-globals
    const ok = confirm('Xoá đánh giá này?');
    if (!ok) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    const p = axios.delete('/api/admin/reviews/' + item._id, config).then(() => {
      this.apiLoad();
    });
    notifyPromise(p, {
      pending: 'Đang xoá đánh giá…',
      success: 'Đã xoá đánh giá.',
      error: 'Xoá đánh giá thất bại.',
    });
  };

  render() {
    const { items, loading, modalOpen, modalMode, activeItem } = this.state;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Đánh giá</h1>
        <p className="ad-page__lead">
          Quản trị đánh giá sản phẩm (sao + nội dung). Chỉ đánh giá{' '}
          <b>đang bật</b> mới hiển thị ở trang chi tiết sản phẩm.
        </p>

        <div className="ad-toolbar">
          <button type="button" className="ad-btn ad-btn--primary" onClick={this.openCreate}>
            Thêm đánh giá
          </button>
        </div>

        <div className="ad-card">
          <div className="ad-card__body" style={{ padding: 0 }}>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th style={{ width: 130 }}>Trạng thái</th>
                    <th>Sản phẩm</th>
                    <th style={{ width: 140 }}>Sao</th>
                    <th style={{ width: 200 }}>Người đánh giá</th>
                    <th>Nội dung</th>
                    <th style={{ width: 210 }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, color: 'var(--ad-muted)' }}>
                        Đang tải…
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 16, color: 'var(--ad-muted)' }}>
                        Chưa có đánh giá.
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => (
                      <tr key={it._id}>
                        <td>
                          <button
                            type="button"
                            className={'ad-pill' + (it.active === 1 ? ' ad-pill--ok' : '')}
                            onClick={() => this.toggleActive(it)}
                          >
                            {it.active === 1 ? 'Đang bật' : 'Tắt'}
                          </button>
                        </td>
                        <td title={it.productId}>
                          <div style={{ fontWeight: 700 }}>{it.productName || '—'}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--ad-muted)' }}>
                            {it.productId || '—'}
                          </div>
                        </td>
                        <td style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {starsText(it.stars)}
                        </td>
                        <td>{it.author || '—'}</td>
                        <td style={{ maxWidth: 520, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {it.content || '—'}
                        </td>
                        <td>
                          <div className="ad-actions">
                            <button
                              type="button"
                              className="ad-btn ad-btn--neutral ad-btn--sm"
                              onClick={() => this.openEdit(it)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="ad-btn ad-btn--danger ad-btn--sm"
                              onClick={() => this.deleteItem(it)}
                            >
                              Xoá
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ReviewDetail
          isOpen={modalOpen}
          mode={modalMode}
          item={activeItem}
          onClose={() => {
            this.closeModal();
            this.apiLoad();
          }}
        />
      </div>
    );
  }
}

export default Review;

