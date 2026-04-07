import React, { useEffect } from 'react';

export default function CustomerModal({
  open,
  title,
  subtitle,
  children,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="cc-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="cc-modal__backdrop"
        onClick={() => onClose && onClose()}
        aria-label="Đóng"
      />
      <div className="cc-modal__card" role="document">
        <header className="cc-modal__head">
          <div className="cc-modal__head-text">
            {title ? <h2 className="cc-modal__title">{title}</h2> : null}
            {subtitle ? <p className="cc-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="cc-modal__close"
            onClick={() => onClose && onClose()}
            aria-label="Đóng"
          >
            ×
          </button>
        </header>
        <div className="cc-modal__body">{children}</div>
      </div>
    </div>
  );
}

