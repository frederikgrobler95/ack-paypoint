import React, { HTMLAttributes, useEffect, useRef } from 'react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  hapticFeedback?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
  showCloseButton = true,
  closeOnOverlayClick = true,
  hapticFeedback = false,
  className = '',
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(50);
    }
    onClose();
  };

  // Handle modal open with haptic feedback
  useEffect(() => {
    if (isOpen && hapticFeedback && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, [isOpen, hapticFeedback]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`modal-native w-full max-w-md transform transition-transform duration-300 ease-out focus:outline-none animate-fade-in-up ${className}`}
        style={{
          maxHeight: '90vh',
          transform: 'translateY(0)',
          marginBottom: 'env(safe-area-inset-bottom)'
        }}
        {...props}
        tabIndex={-1}
      >
        {/* Modal header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            {title ? (
              <h3 className="heading-3">{title}</h3>
            ) : (
              <div></div>
            )}
            {showCloseButton && (
              <button
                onClick={handleCloseClick}
                className="touch-target rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal content */}
        <div className="px-4 py-3 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;