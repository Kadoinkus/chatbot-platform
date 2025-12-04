import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={24} className="text-error-600 dark:text-error-400" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-warning-600 dark:text-warning-400" />;
      case 'success':
        return <CheckCircle size={24} className="text-success-600 dark:text-success-400" />;
      default:
        return <Info size={24} className="text-info-600 dark:text-info-400" />;
    }
  };

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-error-600 hover:bg-error-700 text-white';
      case 'warning':
        return 'bg-warning-600 hover:bg-warning-700 text-white';
      case 'success':
        return 'bg-success-600 hover:bg-success-700 text-white';
      default:
        return 'bg-info-600 hover:bg-info-700 text-white';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center w-12 h-12 mb-4">
          {getIcon()}
        </div>

        <p className="text-foreground-secondary mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background-hover text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles()}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}