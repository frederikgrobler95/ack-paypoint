import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQRCodeCustomer } from '../../../../../queries/qrCodes';
import { useMyAssignment } from '../../../../../contexts/MyAssignmentContext';
import { useTransactionsByCustomer } from '../../../../../queries/transactions';
import StallTransactionCard from '../../../../../shared/ui/StallTransactionCard';
import { Transaction } from '../../../../../shared/contracts/transaction';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { qrCode, idempotencyKey } = location.state || {};
  
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
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
  const stallTransactions: CompatibleTransaction[] = transactionsData?.pages.flatMap(page =>
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
    navigate('/sales/refunds/refundsstep3', {
      state: { qrCode, idempotencyKey, transactionId }
    });
  };
  
  // Loading state
  if (isQrLoading || isTransactionsLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading customer transactions...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isQrError || isTransactionsError || !qrData || !stallId) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 font-semibold">
              {isQrError || !qrData
                ? 'Error loading customer information'
                : isTransactionsError
                ? 'Error loading transactions'
                : !stallId
                ? 'No stall assignment found'
                : 'An unknown error occurred'}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="p-4">
        <p className="text-gray-600 mb-6">Select a transaction to refund for {qrData.customer.name}</p>
        
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{qrData.customer.name}</h2>
              <p className="text-gray-600 text-sm">Customer</p>
            </div>
            <div className="bg-gray-100 rounded-full px-3 py-1">
              <span className="text-gray-800 font-medium">QR: {qrCode.substring(0, 8)}...</span>
            </div>
          </div>
        </div>
        
        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          
          {stallTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found for this customer at your stall.</p>
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
      </div>
    </>
  );
}

export default RefundsStep2Page;