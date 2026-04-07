import { toast } from 'react-toastify';

const BASE = {
  position: 'top-right',
  autoClose: 2800,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export function notifySuccess(message) {
  toast.success(message, BASE);
}

export function notifyError(message) {
  toast.error(message, BASE);
}

export function notifyWarning(message) {
  toast.warning(message, BASE);
}

