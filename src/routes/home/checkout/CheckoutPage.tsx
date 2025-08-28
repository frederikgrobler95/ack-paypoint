/**
 * Checkout Flow - Page Container
 *
 * This file implements the Sales spacing standard via FlowContainer:
 * - Horizontal: px-4 on the outer page container
 * - Vertical: pt-4/pb-4 by default; withNoHeaderOffset/withBottomOffset when needed
 * - Section rhythm: consistent spacing (follows Sales usage)
 * - Respects fixed Header and BottomNavigation components
 *
 * Source of truth: Sales pages implementation
 */
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePayments } from '@/queries/payments';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
import { timestampToDate } from '@/shared/utils';

// Define types for our dummy data
interface Transaction {
  id: string;
  customerName?: string;
  items: number;
  amountCents: number;
  createdAt: any; // Firestore timestamp
}


// Component for displaying total revenue
const TotalRevenueCard: React.FC<{ totalCents: number }> = ({ totalCents }) => {
  const { t } = useTranslation();
  const formattedAmount = (totalCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('totalRevenue')}</h2>
      <p className="text-3xl font-bold text-green-600">R{formattedAmount}</p>
    </div>
  );
};

// Component for displaying individual transactions
const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const { t } = useTranslation();
  const formattedAmount = (transaction.amountCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <div className="ml-3">
          <p className="text-lg font-bold text-gray-900">
            {transaction.customerName || t('customer', { id: transaction.id })}
          </p>
          <p className="text-sm text-gray-500">{t('items', { count: transaction.items })}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-green-600">R{formattedAmount}</div>
        <div className="text-sm text-gray-500">{transaction.createdAt ? timestampToDate(transaction.createdAt).toLocaleDateString() : 'Unknown Date'}</div>
      </div>
    </div>
  );
};

function CheckoutPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { stall } = useMyAssignment();
  
  const stallName = stall?.name || "Your Stall";
  
  const {
    data: paymentsData,
    isLoading,
    error,
    refetch
  } = usePayments(20);
  
  // Flatten the paginated data
  const flatPayments = React.useMemo(() => {
    return paymentsData?.pages.flatMap((page: { data: any[] }) => page.data) || [];
  }, [paymentsData]);
  
  // Transform payment data to our Transaction interface
  const transactions: Transaction[] = flatPayments?.map((payment: any) => ({
    id: payment.id,
    customerName: payment.customerName,
    items: 1, // Payments don't have item counts, so we'll default to 1
    amountCents: payment.amountCents,
    createdAt: payment.createdAt,
  })) || [];
  
  const totalRevenueCents = flatPayments?.reduce((total: number, payment: any) => {
    return total + payment.amountCents;
  }, 0) || 0;
  
  // Invalidate queries when component mounts to refetch data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['payments', 'list', 'all'] });
  }, [queryClient]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingPayments')}</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error')}</h1>
          <p className="text-gray-700 mb-4">{t('failedToLoadPayments')}</p>
          <button
            onClick={() => refetch()}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkoutHeader', { stallName })}</h1>
      <TotalRevenueCard totalCents={totalRevenueCents} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('recentPayments')}</h2>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
            {t('noPaymentsYet')}
          </div>
        )}
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Reset the checkout flow when starting a new checkout
            useFlowStore.getState().startFlow();
            navigate('/checkout/step1');
          }}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </FlowContainer>
  );
}

export default CheckoutPage;