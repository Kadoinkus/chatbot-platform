import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-surface-elevated rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b dark:border-border">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-text-secondary" />
            </button>
          )}
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}