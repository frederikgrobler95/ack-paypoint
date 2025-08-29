import { useEffect, useState } from 'react';

/**
 * Hook to detect page visibility changes
 * Returns true when the page is visible, false when hidden
 */
export const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if the browser supports the Page Visibility API
    if (typeof document === 'undefined' || typeof document.hidden === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};