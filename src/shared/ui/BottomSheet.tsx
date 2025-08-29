import React, { HTMLAttributes, useEffect, useRef, useState } from 'react';

interface BottomSheetProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showHandle?: boolean;
  closeOnOverlayClick?: boolean;
  hapticFeedback?: boolean;
  snapPoints?: string[]; // e.g., ['25%', '50%', '90%']
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose,
  title,
  showHandle = true,
  closeOnOverlayClick = true,
  hapticFeedback = false,
  snapPoints = ['25%', '50%', '90%'],
  className = '',
  ...props
}) => {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(1); // Default to middle snap point
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startTranslateY = useRef(0);
  const isDragging = useRef(false);

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent background scrolling when bottom sheet is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle drag start
  const handleDragStart = (clientY: number) => {
    if (!bottomSheetRef.current) return;
    
    isDragging.current = true;
    startY.current = clientY;
    startTranslateY.current = 0;
    
    // Get current transform value
    const transform = window.getComputedStyle(bottomSheetRef.current).transform;
    if (transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      startTranslateY.current = matrix.m42;
    }
  };

  // Handle drag move
  const handleDragMove = (clientY: number) => {
    if (!isDragging.current || !bottomSheetRef.current) return;
    
    const deltaY = clientY - startY.current;
    const newTranslateY = Math.max(0, startTranslateY.current + deltaY);
    
    bottomSheetRef.current.style.transform = `translateY(${newTranslateY}px)`;
  };

  // Handle drag end
  const handleDragEnd = (clientY: number) => {
    if (!isDragging.current || !bottomSheetRef.current) return;
    
    isDragging.current = false;
    
    const deltaY = clientY - startY.current;
    const velocity = Math.abs(deltaY); // Simple velocity calculation
    
    // Close if dragged down enough or with enough velocity
    if (deltaY > 100 || (deltaY > 50 && velocity > 10)) {
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onClose();
    } else {
      // Snap back to current position with haptic feedback
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(15);
      }
      bottomSheetRef.current.style.transform = '';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      handleDragMove(e.clientY);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging.current) {
      handleDragEnd(e.clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging.current && e.touches.length > 0) {
      handleDragMove(e.touches[0].clientY);
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging.current && e.changedTouches.length > 0) {
      handleDragEnd(e.changedTouches[0].clientY);
    }
  };

  // Handle bottom sheet open with haptic feedback
  useEffect(() => {
    if (isOpen && hapticFeedback && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, [isOpen, hapticFeedback]);

  // Set up drag event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onClose();
    }
  };

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
        ref={bottomSheetRef}
        className={`bottom-sheet w-full max-w-md transform transition-transform duration-300 ease-out focus:outline-none animate-fade-in-up ${className}`}
        style={{
          maxHeight: '90vh',
          height: snapPoints[currentSnapPoint],
          marginBottom: 'env(safe-area-inset-bottom)'
        }}
        {...props}
        tabIndex={-1}
      >
        {/* Drag handle */}
        {showHandle && (
          <div 
            className="flex justify-center py-2 touch-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}

        {/* Bottom sheet header */}
        {title && (
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="heading-3 text-center">{title}</h3>
          </div>
        )}

        {/* Bottom sheet content */}
        <div className="px-4 py-3 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;