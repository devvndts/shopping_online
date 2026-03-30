import { toast } from "react-toastify";

const defaults = {
  position: "top-right",
  autoClose: 3200,
  pauseOnHover: true,
};

export function notifySuccess(message) {
  toast.success(message, defaults);
}

export function notifyError(message) {
  toast.error(message, { ...defaults, autoClose: 4000 });
}

export function notifyWarning(message) {
  toast.warning(message, defaults);
}

export function notifyInfo(message) {
  toast.info(message, defaults);
}
