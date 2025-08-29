import React from 'react';

interface ListContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  withHeaderOffset?: boolean;
  withBottomOffset?: boolean;
}

/**
 * ListContainer provides consistent spacing for list pages.
 *
 * Spacing standard for list pages:
 * - Horizontal padding: px-0 (0rem) by default to allow full-width lists
 * - Vertical padding: pt-3 (0.75rem) at top, pb-12 (3rem) at bottom
 * - Optional header offset: pt-16 (4rem) when withHeaderOffset is true
 * - Optional bottom offset: pb-16 (4rem) when withBottomOffset is true
 */
function ListContainer({
  children,
  className = '',
  noPadding = false,
  withHeaderOffset = false,
  withBottomOffset = false,
}: ListContainerProps): React.JSX.Element {
  // Base classes for horizontal padding
  const baseClasses = noPadding ? '' : 'px-0';
  
  // Vertical padding classes with optional offsets for fixed elements
  const topPadding = withHeaderOffset ? 'pt-16' : 'pt-3';
  const bottomPadding = withBottomOffset ? 'pb-16' : 'pb-12';
  
  const verticalClasses = [
    topPadding,
    bottomPadding
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

export default ListContainer;