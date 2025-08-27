import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactionsByStall } from '@/queries/transactions';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { useStall } from '@/queries/stalls';
import { Transaction as FirestoreTransaction, TransactionType } from '@/shared/contracts/transaction';
import { SharedList, StallTransactionCard } from '@/shared/ui';
import { Timestamp } from 'firebase/firestore';

// Define types for our data
interface Transaction {
  id: string;
  operatorName: string;
  customerName: string;
  amountCents: number;
  type: TransactionType;
  createdAt: Timestamp;
}

// Component for displaying total sales
const TotalSalesCard: React.FC<{ totalCents: number }> = ({ totalCents }) => {
  const formattedAmount = (totalCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Sales</h2>
      <p className="text-3xl font-bold text-green-600">R{formattedAmount}</p>
    </div>
  );
};

function SalesPage(): React.JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { stall: currentStall, isLoading: isAssignmentLoading, error: assignmentError } = useMyAssignment();
  const currentStallId = currentStall?.id || null;
  
  const {
    data: stallData,
    isLoading: isStallLoading,
    error: stallError
  } = useStall(currentStallId || '');
  
  const {
    data: transactionsData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useTransactionsByStall(currentStallId || '');
  
  // Flatten the paginated data
  const flatTransactions = React.useMemo(() => {
    return transactionsData?.pages.flatMap((page: { data: FirestoreTransaction[] }) => page.data as FirestoreTransaction[]) || [];
  }, [transactionsData]);
  
  // Transform Firestore transactions to our Transaction interface
  const transactions: Transaction[] = flatTransactions?.map((transaction: FirestoreTransaction) => ({
    id: transaction.id,
    operatorName: transaction.operatorName,
    customerName: transaction.customerName || transaction.operatorName,
    amountCents: transaction.amountCents,
    type: transaction.type,
    createdAt: transaction.createdAt,
  })) || [];
  
  // Get total amount from stall data
  const totalSalesCents = stallData?.totalAmount || 0;
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  
  // Invalidate queries when component mounts to refetch data
  useEffect(() => {
    if (currentStallId) {
      queryClient.invalidateQueries({ queryKey: ['transactions', 'list', 'stall', currentStallId] });
      queryClient.invalidateQueries({ queryKey: ['stalls', 'detail', currentStallId] });
    }
  }, [queryClient, currentStallId]);
  
  // All hooks must be called before any conditional returns to maintain hook order
  // Show loading state
  if (isAssignmentLoading || isStallLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (assignmentError || stallError) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <p className="text-gray-700 mb-4">There was an error loading your sales data.</p>
          <p className="text-red-500 mb-4">{assignmentError?.toString() || stallError?.toString() || 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Show message if no stall is assigned
  if (!currentStallId || !currentStall) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <p className="text-gray-700 mb-4">You are not currently assigned to any stall.</p>
          <p className="text-gray-500">Please contact your administrator.</p>
        </div>
      </div>
    );
  }
  
  const stallName = currentStall.name || "Your Stall";
  
  // Create a wrapper function for refetch to match the expected signature
  const handleRefresh = async () => {
    await refetch();
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
            aria-label="More options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              style={{ top: '100%' }}
            >
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/sales/refunds/refundsstep1');
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Refund
              </button>
            </div>
          )}
        </div>
      </div>
      <TotalSalesCard totalCents={totalSalesCents} />

 <SharedList<Transaction>
        data={transactions}
        renderItem={(transaction: Transaction) => <StallTransactionCard transaction={transaction} />}
        onRefresh={handleRefresh}
        hasMore={hasNextPage}
        loadMore={() => fetchNextPage()}
        isLoading={isLoading || isFetchingNextPage}
        isError={!!error}
        isEmpty={transactions.length === 0}
        emptyMessage="No transactions yet"
        errorMessage={`Failed to load transactions: ${(error as Error)?.message || 'Unknown error'}`}
        loadingMessage="Loading transactions..."
      />

     
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => navigate('/sales/salesstep1')}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

export default SalesPage;