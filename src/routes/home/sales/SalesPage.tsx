import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactionsByStall } from '@/queries/transactions';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { useStall } from '@/queries/stalls';
import { Transaction as FirestoreTransaction, TransactionType } from '@/shared/contracts/transaction';
import { SharedList, StallTransactionCard } from '@/shared/ui';
import { Timestamp } from 'firebase/firestore';
import { useFlowStore } from '@/shared/stores/flowStore';

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
  const { t } = useTranslation();
  const formattedAmount = (totalCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('salesPage.totalSales')}</h2>
      <p className="text-3xl font-bold text-green-600">R{formattedAmount}</p>
    </div>
  );
};

function SalesPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">{t('salesPage.loadingSalesData')}</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (assignmentError || stallError) {
    return (
      <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <p className="text-gray-700 mb-4">{t('salesPage.errorLoadingSalesData')}</p>
          <p className="text-red-500 mb-4">{assignmentError?.toString() || stallError?.toString() || t('salesPage.unknownError')}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {t('salesPage.retry')}
          </button>
        </div>
      </div>
    );
  }
  
  // Show message if no stall is assigned
  if (!currentStallId || !currentStall) {
    return (
      <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <p className="text-gray-700 mb-4">{t('salesPage.notAssignedToStall')}</p>
          <p className="text-gray-500">{t('salesPage.contactAdmin')}</p>
        </div>
      </div>
    );
  }
  
  const stallName = currentStall.name || t('salesPage.yourStall');
  
  // Create a wrapper function for refetch to match the expected signature
  const handleRefresh = async () => {
    await refetch();
  };
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <TotalSalesCard totalCents={totalSalesCents} />
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList<Transaction>
          data={transactions}
          renderItem={(transaction: Transaction) => <StallTransactionCard transaction={transaction} />}
          onRefresh={handleRefresh}
          hasMore={hasNextPage}
          loadMore={() => fetchNextPage()}
          isLoading={isLoading || isFetchingNextPage}
          isError={!!error}
          isEmpty={transactions.length === 0}
          emptyMessage={t('salesPage.noTransactionsYet')}
          errorMessage={t('salesPage.failedToLoadTransactions', { error: (error as Error)?.message || t('salesPage.unknownError') })}
          loadingMessage={t('salesPage.loadingTransactions')}
        />
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6 z-50">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Reset the sales flow when starting a new sale
            useFlowStore.getState().startFlow();
            navigate('/sales/salesstep1');
          }}
        >
          <span className="text-xl">{t('salesPage.newSale')}</span>
        </button>
      </div>
    </div>
  );
}

export default SalesPage;