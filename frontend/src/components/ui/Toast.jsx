import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default toast container configuration
export const ToastProvider = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    className="toast-container"
  />
);

// Toast helper functions with consistent styling
export const showToast = {
  success: (message) => {
    toast.success(message, {
      className: 'toast-success',
      progressClassName: 'toast-success-progress',
      autoClose: 2000,
    });
  },
  
  error: (error, action = '') => {
    const message = error?.response?.data?.message || 
      (action ? `Failed to ${action}` : 'An error occurred');
    
    toast.error(message, {
      className: 'toast-error',
      progressClassName: 'toast-error-progress',
      autoClose: 4000,
    });
  },
  
  info: (message) => {
    toast.info(message, {
      className: 'toast-info',
      progressClassName: 'toast-info-progress',
      autoClose: 3000,
    });
  },
  
  warning: (message) => {
    toast.warning(message, {
      className: 'toast-warning',
      progressClassName: 'toast-warning-progress',
      autoClose: 3000,
    });
  }
}; 