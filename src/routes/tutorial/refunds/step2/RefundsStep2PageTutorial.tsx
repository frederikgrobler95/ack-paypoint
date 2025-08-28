import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';
import { useToast } from '../../../../contexts/ToastContext';

// Define the steps for the refunds step 2 tutorial
const refundsStep2TutorialSteps = [
  {
    target: '.customer-info',
    content: 'Here you can see the customer information retrieved from the QR code scan.',
    disableBeacon: true,
  },
  {
    target: '.transaction-list',
    content: 'This shows all transactions for this customer at the current stall. Select the transaction you want to refund.',
  },
  {
    target: '.select-transaction-button',
    content: 'Click on a transaction to select it for refund processing.',
  },
];

function RefundsStep2PageTutorial() {
  const navigate = useNavigate();
  const { mockRefundsData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const { showToast } = useToast();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
  // Filter to show only sale transactions (that can be refunded)
  const saleTransactions = mockRefundsData.transactions.filter(t => t.type === 'sale');
  
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    // In tutorial mode, just show a success message and navigate to next step
    showToast('Transaction selected for refund', 'success');
    
    // Navigate to next step
    navigateToNextTutorialStep(location.pathname);
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep2TutorialSteps} />
      
      <p className="text-gray-600 mb-6">Select a transaction to refund for {mockRefundsData.customerName}</p>
      
      {/* Customer Info */}
      <div className="customer-info bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{mockRefundsData.customerName}</h2>
            <p className="text-gray-600 text-sm">Customer</p>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1">
            <span className="text-gray-800 font-medium">QR: {mockRefundsData.qrCode?.substring(0, 8) + '...'}</span>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="transaction-list bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        
        {saleTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for this customer at your stall.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {saleTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionSelect(transaction.id)}
                className={`select-transaction-button cursor-pointer transition-all duration-150 ${
                  selectedTransactionId === transaction.id
                    ? 'ring-2 ring-indigo-500 rounded-md'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">Transaction #{transaction.id.substring(0, 8)}</p>
                      <p className="text-gray-600 text-sm">Operator: {transaction.operatorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">R{formatAmount(transaction.amountCents)}</p>
                      <p className="text-gray-500 text-sm">
                        {transaction.createdAt instanceof Date
                          ? transaction.createdAt.toLocaleDateString()
                          : 'Today'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Sale
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">
          Important Note
        </h3>
        <p className="text-sm text-yellow-700">
          Only sale transactions at the current stall can be refunded. Refund transactions and other transaction types
          are not eligible for refunds.
        </p>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep2PageTutorial;