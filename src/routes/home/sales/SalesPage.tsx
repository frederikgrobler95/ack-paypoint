import React from 'react'
import { useTransactionsByStall } from '@/queries/transactions';
import { useWorkStore } from '@/shared/stores/workStore';
import { Transaction as FirestoreTransaction, TransactionType } from '@/shared/contracts/transaction';
import { SharedList } from '@/shared/ui';

// Define types for our data
interface Transaction {
  id: string;
  operatorName: string;
  customerName: string;
  amountCents: number;
  type: TransactionType;
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

// Component for displaying individual transactions
const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const formattedAmount = (Math.abs(transaction.amountCents) / 100).toFixed(2);
  const isRefund = transaction.type === 'refund';
  const isSale = transaction.type === 'sale';
  
  // Determine styling based on transaction type
  const getTypeColor = () => {
    if (isRefund) return 'bg-red-100 text-red-800';
    if (isSale) return 'bg-green-100 text-green-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getTypeText = () => {
    if (isRefund) return 'Refund';
    if (isSale) return 'Sale';
    return 'Sale';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor()}`}>
          {getTypeText()}
        </div>
        <div className="ml-3">
          <p className="text-lg font-bold text-gray-900">{transaction.customerName}</p>
          <p className="text-sm text-gray-500">Operator: {transaction.operatorName}</p>
        </div>
      </div>
      <div className={`text-lg font-semibold ${isRefund ? 'text-red-600' : 'text-green-600'}`}>
        {isRefund ? '-R' : 'R'}{formattedAmount}
      </div>
    </div>
  );
};

function SalesPage(): React.JSX.Element {
  const currentStallId = useWorkStore((state: { currentStallId: string | null }) => state.currentStallId);
  const currentStall = useWorkStore((state: { currentStall: any }) => state.currentStall);
  
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
  })) || [];
  
  // Calculate total sales from transactions
  const totalSalesCents = transactions?.reduce((total, transaction) => {
    // Only count sale transactions in total sales
    return transaction.type === 'sale' ? total + transaction.amountCents : total;
  }, 0) || 0;
  
  // Show message if no stall is assigned
  if (!currentStallId || !currentStall) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Stall Assignment</h1>
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{stallName} Sales</h1>
      <TotalSalesCard totalCents={totalSalesCents} />
      
      <SharedList<Transaction>
        data={transactions}
        renderItem={(transaction: Transaction) => <TransactionCard transaction={transaction} />}
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
          onClick={() => {
            // Navigation to sales flow would go here
            console.log('Initiate sales flow');
          }}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

export default SalesPage;