import React, { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  borderRadius,
  animation = 'pulse',
  className = '',
  ...props
}) => {
  // Base classes
  let baseClasses = 'skeleton-native ';
  
  // Animation classes
  switch (animation) {
    case 'pulse':
      baseClasses += 'animate-pulse-smooth ';
      break;
    case 'wave':
      baseClasses += 'animate-pulse-smooth ';
      break;
    case 'none':
      break;
  }
  
  // Variant classes
  switch (variant) {
    case 'text':
      baseClasses += 'h-4 rounded ';
      break;
    case 'circular':
      baseClasses += 'rounded-full ';
      break;
    case 'rectangular':
      baseClasses += 'rounded-lg ';
      break;
  }
  
  // Custom styles
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = width;
  if (height !== undefined) style.height = height;
  if (borderRadius !== undefined) style.borderRadius = borderRadius;
  
  // Combine classes
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <div
      className={combinedClasses}
      style={style}
      {...props}
      aria-hidden="true"
    />
  );
};

export default Skeleton;