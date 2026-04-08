import React, { useEffect } from 'react';

/**
 * Modal đồng bộ admin: backdrop, ESC đóng, chặn cuộn body.
 */
export default function AdminModal({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  wide,
  extraWide,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="ad-modal-root"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={
          'ad-modal-panel' +
          (extraWide ? ' ad-modal-panel--xl' : wide ? ' ad-modal-panel--wide' : '')
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ad-modal-panel__head">
          <div className="ad-modal-panel__head-text">
            <h2 id="ad-modal-title" className="ad-modal-panel__title">
              {title}
            </h2>
            {subtitle ? (
              <p className="ad-modal-panel__subtitle">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="ad-modal-panel__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>
        <div className="ad-modal-panel__body">{children}</div>
      </div>
    </div>
  );
}
