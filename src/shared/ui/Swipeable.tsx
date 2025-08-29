import React, { HTMLAttributes, useRef, useState } from 'react';

interface SwipeableProps extends HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hapticFeedback?: boolean;
  threshold?: number; // Minimum distance for a swipe to be recognized
}

const Swipeable: React.FC<SwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  hapticFeedback = false,
  threshold = 50,
  className = '',
  ...props
}) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setStartX(e.touches[0].clientX);
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling when swiping
    if (e.touches.length > 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length > 0) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const diffX = startX - endX;
      const diffY = startY - endY;
      
      // Check if the movement was mostly horizontal or vertical
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0 && onSwipeLeft) {
            if (hapticFeedback && navigator.vibrate) {
              navigator.vibrate(50);
            }
            onSwipeLeft();
          } else if (diffX < 0 && onSwipeRight) {
            if (hapticFeedback && navigator.vibrate) {
              navigator.vibrate(50);
            }
            onSwipeRight();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(diffY) > threshold) {
          if (diffY > 0 && onSwipeUp) {
            if (hapticFeedback && navigator.vibrate) {
              navigator.vibrate(50);
            }
            onSwipeUp();
          } else if (diffY < 0 && onSwipeDown) {
            if (hapticFeedback && navigator.vibrate) {
              navigator.vibrate(50);
            }
            onSwipeDown();
          }
        }
      }
    }
  };

  return (
    <div
      ref={elementRef}
      className={`swipeable-item ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

export default Swipeable;