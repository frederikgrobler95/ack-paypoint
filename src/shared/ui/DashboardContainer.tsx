import React from 'react';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * DashboardContainer provides consistent spacing for dashboard pages.
 * 
 * Spacing standard for dashboard pages:
 * - Horizontal padding: px-4 (1rem) by default
 * - Vertical padding: pt-6 (1.5rem) at top, pb-16 (4rem) at bottom
 * - Responsive grid layout for dashboard cards
 */
function DashboardContainer({
  children,
  className = '',
  noPadding = false,
}: DashboardContainerProps): React.JSX.Element {
  // Base classes for horizontal padding
  const baseClasses = noPadding ? '' : 'px-4';
  
  // Vertical padding classes
  const verticalClasses = 'pt-6 pb-16';
  
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

export default DashboardContainer;