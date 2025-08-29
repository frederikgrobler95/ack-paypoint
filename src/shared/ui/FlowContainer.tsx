import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FlowContainerProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  withHeaderOffset?: boolean;
  withBottomOffset?: boolean;
  withNoHeaderOffset?: boolean;
  withNoBottomOffset?: boolean;
  showCancelButton?: boolean;
}

/**
 * FlowContainer provides consistent spacing for flow pages.
 *
 * Spacing standard based on Sales pages:
 * - Horizontal padding: px-4 (1rem) by default
 * - Vertical padding: pt-3 (0.75rem) at top, responsive padding at bottom
 * - Vertical rhythm: mb-4 (1rem) between sections (handled by consumers)
 * - Header offset: pt-16 (4rem) when withHeaderOffset is true
 * - Bottom offset: pb-16 (4rem) when withBottomOffset is true
 * - withNoHeaderOffset: removes default pt-3 padding (use when you want no top padding)
 * - withNoBottomOffset: removes default pb-6 padding (use when you want no bottom padding)
 */
function FlowContainer({
  children,
  className = '',
  noPadding = false,
  withHeaderOffset = false,
  withBottomOffset = false,
  withNoHeaderOffset = false,
  withNoBottomOffset = false,
  showCancelButton = false,
}: FlowContainerProps): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Base classes for horizontal padding
  const baseClasses = noPadding ? '' : 'px-4';
  
  // Vertical padding classes with optional offsets for fixed elements
  // Default padding is pt-3 and pb-6 unless withNoHeaderOffset or withNoBottomOffset is true
  const topPadding = withNoHeaderOffset ? '' : 'pt-3';
  const bottomPadding = withNoBottomOffset ? '' : 'pb-6';
  
  // Header and bottom offsets override default padding
  const headerOffset = withHeaderOffset ? 'pt-16' : topPadding;
  const bottomOffset = withBottomOffset ? 'pb-16' : bottomPadding;
  
  const verticalClasses = [
    headerOffset,
    bottomOffset
  ].filter(Boolean).join(' ');
  
  // Combine all classes
  const combinedClasses = [
    baseClasses,
    verticalClasses,
    className
  ].filter(Boolean).join(' ');

  const handleCancel = () => {
    // Navigate to the home screen
    navigate('/');
  };

  return (
    <div className={`${combinedClasses} h-full`}>
      {showCancelButton && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md transition-colors duration-200"
            aria-label={t('cancelFlow') || t('cancel') || 'Cancel'}
          >
            {t('cancelFlow') || t('cancel') || 'Cancel'}
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

export default FlowContainer;