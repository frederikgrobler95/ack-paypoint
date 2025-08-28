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
    
    // Check if we've scrolled to the bottom (with a larger threshold for better detection)
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && loadMore && !isLoading) {
        loadMore();
      }
    }
  };

  // Render loading state
  if (isLoading && data.length === 0) {
    return (
      <div className="flex justify-center items-center flex-1 w-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007BFF] mb-2"></div>
          <p className="text-[#4A5568] text-base font-normal leading-6">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center flex-1 w-full">
        <div className="text-center p-4 bg-[#FBEBEE] rounded-lg">
          <p className="text-[#DC3545] font-medium text-base leading-6">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (isEmpty || data.length === 0) {
    return (
      <div className="flex justify-center items-center flex-1 w-full">
        <div className="text-center p-4">
          <p className="text-[#A0AEC0] text-base leading-6">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render list with pull to refresh and infinite scroll
  return (
    <div className="h-full w-full flex flex-col relative">
      <PullToRefresh onRefresh={handleRefresh} pullingContent="" refreshingContent={
        <div className="flex justify-center py-4 relative z-50 bg-white">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#007BFF]"></div>
        </div>
      }>
        <div
          className="overflow-y-auto h-full w-full flex flex-col relative z-10"
          onScroll={handleScroll}
        >
          <ul className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-lg overflow-hidden relative z-10 flex-shrink-0">
            {data.map((item, index) => (
              <li key={index} className="bg-[#FFFFFF] hover:bg-[#F7FAFC] transition-colors duration-200 relative z-10">
                {renderItem(item, index)}
              </li>
            ))}
          </ul>
          
          {/* Loading more indicator */}
          {hasMore && isLoading && (
            <div className="flex justify-center py-4 flex-shrink-0">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#007BFF]"></div>
            </div>
          )}
          
          {/* End of list indicator */}
          {!hasMore && data.length > 0 && (
            <div className="flex justify-center py-4 flex-shrink-0">
              <p className="text-[#A0AEC0] text-sm">No more items to load</p>
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default SharedList;