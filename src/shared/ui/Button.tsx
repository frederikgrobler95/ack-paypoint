import React, { ButtonHTMLAttributes, useState, useRef, useEffect } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  ripple?: boolean; // Enable ripple effect
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  ripple = true,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  // Base button classes with enhanced mobile styling and accessibility
  let baseClasses = 'font-semibold rounded-lg transition-native focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative overflow-hidden touch-target scale-on-press button-text ';

  // Variant classes based on design system with enhanced states
  switch (variant) {
    case 'primary':
      baseClasses += 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-100 active:bg-blue-800 active:shadow-inner disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:opacity-70 ';
      break;
    case 'secondary':
      baseClasses += 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500 focus:ring-offset-gray-100 active:bg-gray-400 active:shadow-inner disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-70 ';
      break;
    case 'danger':
      baseClasses += 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-red-100 active:bg-red-800 active:shadow-inner disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-70 ';
      break;
    default:
      baseClasses += 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-100 active:bg-blue-800 active:shadow-inner disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:opacity-70 ';
  }

  // Size classes based on design system with proper touch targets
  switch (size) {
    case 'small':
      baseClasses += 'px-3 py-2 text-sm min-h-[44px] ';
      break;
    case 'medium':
      baseClasses += 'px-4 py-3 text-base min-h-[48px] ';
      break;
    case 'large':
      baseClasses += 'px-6 py-4 text-lg min-h-[56px] ';
      break;
    default:
      baseClasses += 'px-4 py-3 text-base min-h-[48px] ';
  }

  // Combine base classes with any custom classes
  const combinedClasses = `${baseClasses} ${className}`;

  // Handle ripple effect for both mouse and touch events
  const handleRipple = (clientX: number, clientY: number) => {
    if (!ripple || !buttonRef.current) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    rippleId.current += 1;
    setRipples(prev => [...prev, { x, y, id: rippleId.current }]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId.current));
    }, 600);
  };

  // Handle haptic feedback
  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(15); // Short vibration for click feedback
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleRipple(e.clientX, e.clientY);
    triggerHapticFeedback();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleRipple(touch.clientX, touch.clientY);
      triggerHapticFeedback();
    }
  };

  // Clean up ripples when component unmounts
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      className={combinedClasses}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-30 animate-ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;