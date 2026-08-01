import { HiOutlineExclamation, HiOutlineX } from 'react-icons/hi';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: 'bg-danger-50 text-danger-600',
      button: 'btn-danger',
    },
    warning: {
      icon: 'bg-warning-50 text-warning-600',
      button: 'bg-warning-600 text-white hover:bg-warning-600/90',
    },
  };

  const scheme = colors[type] || colors.danger;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${scheme.icon}`}>
            <HiOutlineExclamation className="text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
            <p className="text-sm text-surface-500 mt-1">{message}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-surface-100 text-surface-400">
            <HiOutlineX className="text-lg" />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary" id="confirm-cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} className={`btn ${scheme.button}`} id="confirm-ok-btn">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
