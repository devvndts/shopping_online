import { toast } from 'react-toastify';

const BASE = {
  position: 'top-right',
  autoClose: 2800,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

/** Lấy message từ lỗi axios hoặc Error/string. */
export function axiosErrorMessage(err, fallback = 'Có lỗi xảy ra.') {
  if (err == null) return fallback;
  if (typeof err === 'string' && err.trim()) return err.trim();
  const d = err.response && err.response.data;
  if (d && typeof d.message === 'string' && d.message.trim()) {
    return d.message.trim();
  }
  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}

/**
 * Toast loading → success/error theo promise (upload, API chậm).
 * @param {Promise<unknown>} promise
 * @param {{ pending?: string, success?: string, error?: string }} messages
 */
export function notifyPromise(promise, messages = {}) {
  const pending = messages.pending ?? 'Đang xử lý…';
  const success = messages.success ?? 'Thành công.';
  const errorFallback = messages.error ?? 'Thất bại.';
  return toast.promise(
    promise,
    {
      pending,
      success,
      error: (err) => axiosErrorMessage(err, errorFallback),
    },
    { ...BASE }
  );
}

export function notifySuccess(message) {
  toast.success(message, BASE);
}

export function notifyError(message) {
  toast.error(message, BASE);
}

export function notifyWarning(message) {
  toast.warning(message, BASE);
}

