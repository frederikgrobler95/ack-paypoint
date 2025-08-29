import React, { ReactNode, useCallback } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';

interface SharedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onRefresh?: () => Promise<any>;
  hasMore?: boolean;
  loadMore?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  skeletonCount?: number; // Number of skeleton items to show when loading
}

const SharedList = <T,>({
  data,
  renderItem,
  onRefresh,
  hasMore,
  loadMore,
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "No data available",
  errorMessage = "An error occurred while loading data",
  loadingMessage = "Loading...",
  skeletonCount = 5
}: SharedListProps<T>): React.JSX.Element => {
  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
  }, [onRefresh]);

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Check if we've scrolled to the bottom (with a larger threshold for better detection)
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && loadMore && !isLoading) {
        loadMore();
      }
    }
  };

  // Render loading state with native-like skeleton
  if (isLoading && data.length === 0) {
    return (
      <div className="flex flex-col h-full w-full">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="list-item-native-compact">
            <div className="flex items-center space-x-3">
              <div className="skeleton-native w-10 h-10 rounded-full"></div>
              <div className="flex-1 py-1">
                <div className="skeleton-native h-4 w-3/4 mb-1"></div>
                <div className="skeleton-native h-3 w-1/2"></div>
              </div>
              <div className="skeleton-native w-6 h-6 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center flex-1 w-full">
        <div className="text-center p-3 bg-[#FBEBEE] rounded-lg">
          <p className="text-[#DC3545] font-medium text-base leading-5 body-default">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (isEmpty || data.length === 0) {
    return (
      <div className="flex justify-center items-center flex-1 w-full">
        <div className="text-center p-3">
          <p className="text-[#A0AEC0] text-base leading-5">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render list with pull to refresh and infinite scroll
  return (
    <div className="h-full w-full flex flex-col relative animate-fade-in" role="list">
      <PullToRefresh onRefresh={handleRefresh} pullingContent={
        <div className="pull-to-refresh-indicator" aria-label="Pull to refresh">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      } refreshingContent={
        <div className="pull-to-refresh-indicator" aria-label="Refreshing content">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#007BFF]"></div>
        </div>
      }>
        <div
          className="overflow-y-auto h-full w-full flex flex-col relative"
          onScroll={handleScroll}
          role="list"
        >
          <ul className="flex-shrink-0">
            {data.map((item, index) => (
              <li key={index} className="list-item-native-compact">
                {renderItem(item, index)}
              </li>
            ))}
          </ul>
          
          {/* Loading more indicator */}
          {hasMore && isLoading && (
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#007BFF]"></div>
            </div>
          )}
          
          {/* End of list indicator */}
          {!hasMore && data.length > 0 && (
            <div className="flex justify-center py-3 flex-shrink-0">
              <p className="text-[#A0AEC0] text-sm">No more items to load</p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default SharedList;