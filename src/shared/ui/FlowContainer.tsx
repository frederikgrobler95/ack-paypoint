import React from 'react';

interface FlowContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  withHeaderOffset?: boolean;
  withBottomOffset?: boolean;
  withNoHeaderOffset?: boolean;
}

/**
 * FlowContainer provides consistent spacing for flow pages.
 * 
 * Spacing standard based on Sales pages:
 * - Horizontal padding: px-4 (1rem) by default
 * - Vertical padding: pt-4 (1rem) at top, responsive padding at bottom
 * - Vertical rhythm: mb-6 (1.5rem) between sections (handled by consumers)
 * - Header offset: pt-16 (4rem) when withHeaderOffset is true
 * - Bottom offset: pb-16 (4rem) when withBottomOffset is true
 */
function FlowContainer({
  children,
  className = '',
  noPadding = false,
  withHeaderOffset = false,
  withBottomOffset = false,
  withNoHeaderOffset = false,
}: FlowContainerProps): React.JSX.Element {
  // Base classes for horizontal padding
  const baseClasses = noPadding ? '' : 'px-4';
  
  // Vertical padding classes with optional offsets for fixed elements
  const verticalClasses = [
    withHeaderOffset ? 'pt-16' : 'pt-4',
    withBottomOffset ? 'pb-16' : 'pb-4',
    withNoHeaderOffset ? '' : 'md:pb-24'
  ].filter(Boolean).join(' ');
  
  // Combine all classes
  const combinedClasses = [
    baseClasses,
    verticalClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
}

export default FlowContainer;