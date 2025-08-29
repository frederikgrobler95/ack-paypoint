import React, { HTMLAttributes, useState } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: '1' | '2' | '3' | '4';
  pressedElevation?: '1' | '2' | '3' | '4';
  onPress?: () => void;
  disabled?: boolean;
  ripple?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevation = '2',
  pressedElevation = '1',
  onPress,
  disabled = false,
  ripple = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const rippleId = React.useRef(0);

  const handlePress = () => {
    if (onPress && !disabled) {
      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      onPress();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onPress && !disabled) {
      setIsPressed(true);
      
      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        rippleId.current += 1;
        setRipples(prev => [...prev, { x, y, id: rippleId.current }]);
        
        // Remove ripple after animation completes
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== rippleId.current));
        }, 600);
      }
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (onPress && !disabled && e.touches.length > 0) {
      setIsPressed(true);
      
      // Trigger haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      
      if (ripple) {
        const touch = e.touches[0];
        const rect = e.currentTarget.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        rippleId.current += 1;
        setRipples(prev => [...prev, { x, y, id: rippleId.current }]);
        
        // Remove ripple after animation completes
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== rippleId.current));
        }, 600);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  // Base card classes
  let baseClasses = 'card-native transition-native rounded-xl relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 scale-on-press ';
  
  // Elevation classes
  if (isPressed && onPress && !disabled) {
    baseClasses += `elevation-${pressedElevation} `;
  } else {
    baseClasses += `elevation-${elevation} `;
  }
  
  // Disabled state
  if (disabled) {
    baseClasses += 'opacity-60 cursor-not-allowed ';
  } else if (onPress) {
    baseClasses += 'cursor-pointer active:card-native-pressed focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ';
  }

  // Combine classes
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <div
      className={combinedClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handlePress}
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
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;