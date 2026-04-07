import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import SlideDetail from './SlideDetailComponent';

class Slide extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      slides: [],
      loading: true,
      modal: null,
    };
  }

  componentDidMount() {
    this.apiGetSlides();
  }

  apiGetSlides() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios
      .get('/api/admin/slides', config)
      .then((res) => {
        this.setState({ slides: res.data || [], loading: false });
      })
      .catch(() => {
        this.setState({ slides: [], loading: false });
      });
  }

  openCreate = () => this.setState({ modal: { mode: 'create' } });
  openEdit = (item) => this.setState({ modal: { mode: 'edit', item } });
  closeModal = () => this.setState({ modal: null });

  render() {
    const { slides, loading, modal } = this.state;
    const activeId = modal && modal.item ? modal.item._id : null;

    return (
      <div className="ad-page">
        <h1 className="ad-page__title">Slides trang chủ</h1>
        <p className="ad-page__lead">
          Quản trị slider hiển thị dưới header ở trang chủ client-customer. Ảnh
          khuyến nghị 1200×500.
        </p>

        <div className="ad-card">
          <div className="ad-card__head ad-card__head--row">
            <h2 className="ad-card__title">Danh sách</h2>
            <button type="button" className="ad-btn ad-btn--ghost" onClick={this.openCreate}>
              + Thêm slide
            </button>
          </div>
          <div className="ad-card__body">
            {loading ? (
              <p style={{ margin: 0, padding: '18px', color: 'var(--ad-muted)' }}>Đang tải…</p>
            ) : (
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tiêu đề</th>
                      <th>Sort</th>
                      <th>Active</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slides.map((s) => (
                      <tr
                        key={s._id}
                        className={activeId === s._id ? 'ad-table__row--active' : ''}
                        onClick={() => this.openEdit(s)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          {s.imageMime && s.imageData ? (
                            <img
                              src={`data:${s.imageMime};base64,${s.imageData}`}
                              alt=""
                              style={{
                                width: 120,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 10,
                                border: '1px solid rgba(15,23,42,0.12)',
                              }}
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{s.title || '—'}</td>
                        <td>{s.sort ?? 0}</td>
                        <td>{s.active === 1 ? 'Yes' : 'No'}</td>
                        <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.href || '—'}
                        </td>
                      </tr>
                    ))}
                    {slides.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '18px', color: 'var(--ad-muted)' }}>
                          Chưa có slide.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <SlideDetail
          open={!!modal}
          item={modal && modal.mode === 'edit' ? modal.item : null}
          onClose={this.closeModal}
          onSaved={() => this.apiGetSlides()}
        />
      </div>
    );
  }
}

export default Slide;

