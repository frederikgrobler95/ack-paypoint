import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQRCodeCustomer } from '../../../../../queries/qrCodes';
import { useMyAssignment } from '../../../../../contexts/MyAssignmentContext';
import { useTransactionsByCustomer } from '../../../../../queries/transactions';
import StallTransactionCard from '../../../../../shared/ui/StallTransactionCard';
import { Transaction } from '../../../../../shared/contracts/transaction';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
// Define a compatible transaction type for StallTransactionCard
interface CompatibleTransaction {
  id: string;
  operatorName: string;
  customerName: string;
  amountCents: number;
  type: 'sale' | 'refund';
  createdAt: any; // Using any to match the component's expectation
}

function RefundsStep2Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { flowData } = useFlowStore();
  const { qrCode, idempotencyKey } = flowData;
  
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
  // Redirect to step 1 if step 1 is not complete
  
  // Fetch customer details using the QR code
  const { data: qrData, isLoading: isQrLoading, isError: isQrError } = useQRCodeCustomer(qrCode);
  
  // Get current stall information
  const { assignment } = useMyAssignment();
  const stallId = assignment?.stallId;
  
  // Fetch transactions for this customer at the current stall
  const { data: transactionsData, isLoading: isTransactionsLoading, isError: isTransactionsError } = useTransactionsByCustomer(
    qrData?.customer.id || '',
    50 // Fetch up to 50 transactions
  );
  
  // Filter transactions to only show sales at the current stall and convert to compatible type
  const stallTransactions: CompatibleTransaction[] =    transactionsData?.pages.flatMap(page =>
      page.data
        .filter((txn: Transaction) => txn.stallId === stallId && txn.type === 'sale')
        .map((txn: Transaction) => ({
          ...txn,
          customerName: txn.customerName || qrData?.customer.name || 'Unknown Customer',
          operatorName: txn.operatorName || 'Unknown Operator'
        }))
    ) || [];
  
  // Handle transaction selection
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    // Mark step 2 as complete
    useFlowStore.getState().setFlowData({ step: 2, transactionId });
    navigate('/sales/refunds/refundsstep3');
  };
  
  // Loading state
  if (isQrLoading || isTransactionsLoading) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">{t('refundsStep2.loadingCustomerTransactions')}</p>
        </div>
      </FlowContainer>
    );
  }
  
  // Error state
  if (isQrError || isTransactionsError || !qrData || !stallId) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold">
              {isQrError || !qrData
                ? t('refundsStep2.errorLoadingCustomerInfo')
                : isTransactionsError
                ? t('refundsStep2.errorLoadingTransactions')
                : !stallId
                ? t('refundsStep2.noStallAssignment')
                : t('refundsStep2.unknownError')}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              {t('refundsStep2.goBack')}
            </button>
          </div>
        </div>
      </FlowContainer>
    );
  }
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      
      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{qrData?.customer.name}</h2>
            <p className="text-gray-600 text-sm">{t('refundsStep2.customer')}</p>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1">
            <span className="text-gray-800 font-medium">{t('refundsStep2.qr')}: {qrCode?.substring(0, 8) + '...'}</span>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('refundsStep2.recentTransactions')}</h2>
        
        {stallTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('refundsStep2.noTransactionsFound')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stallTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionSelect(transaction.id)}
                className={`cursor-pointer transition-all duration-150 ${
                  selectedTransactionId === transaction.id
                    ? 'ring-2 ring-indigo-500 rounded-md'
                    : 'hover:bg-gray-50'
                }`}
              >
                <StallTransactionCard transaction={transaction} />
              </div>
            ))}
          </div>
        )}
      </div>
    </FlowContainer>
  );
}

export default RefundsStep2Page;