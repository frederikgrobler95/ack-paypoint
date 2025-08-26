import React, { ReactNode, useCallback } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';

interface SharedListProps<T> {
  data: T[];
  renderItem: (item: T) => ReactNode;
  onRefresh?: () => Promise<any>;
  hasMore?: boolean;
  loadMore?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
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
  loadingMessage = "Loading..."
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
    
    // Check if we've scrolled to the bottom (with a small threshold)
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      if (hasMore && loadMore && !isLoading) {
        loadMore();
      }
    }
  };

  // Render loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (isEmpty || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center p-4">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render list with pull to refresh and infinite scroll
  return (
    <PullToRefresh onRefresh={handleRefresh} pullingContent="" refreshingContent={
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <div 
        className="overflow-y-auto h-full"
        onScroll={handleScroll}
      >
        {data.map((item, index) => (
          <div key={index}>
            {renderItem(item)}
          </div>
        ))}
        
        {/* Loading more indicator */}
        {hasMore && isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default SharedList;