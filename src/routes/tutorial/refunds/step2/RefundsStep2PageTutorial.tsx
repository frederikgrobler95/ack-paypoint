import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { timestampToDate } from '@/shared/utils';
import { useTranslation } from 'react-i18next';

function RefundsStep2PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the refunds step 2 tutorial
  const refundsStep2TutorialSteps = [
    {
      target: '.customer-info',
      content: t('tutorial.refunds.step2.customerInfoContent'),
      disableBeacon: true,
    },
    {
      target: '.transaction-list',
      content: t('tutorial.refunds.step2.transactionListContent'),
    },
    {
      target: '.select-transaction-button',
      content: t('tutorial.refunds.step2.selectTransactionButtonContent'),
    },
  ];
  const { mockRefundsData } = useTutorialStore();
  const { setRefundsStepComplete } = useTutorialStore();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  
  // Filter to show only sale transactions (that can be refunded)
  const saleTransactions = mockRefundsData.transactions.filter((t: any) => t.type === 'sale');
  
  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    // In tutorial mode, just show a success message and navigate to next step
    
    // Navigate to next step
    setRefundsStepComplete(2);
    navigate('/tutorial/refunds/step3');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep2TutorialSteps} />
      
      <p className="text-gray-600 mb-6">{t('tutorial.refunds.step2.selectTransactionMessage', { customerName: mockRefundsData.customerName })}</p>
      
      {/* Customer Info */}
      <div className="customer-info bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{mockRefundsData.customerName}</h2>
            <p className="text-gray-600 text-sm">{t('tutorial.refunds.step2.customerLabel')}</p>
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1">
            <span className="text-gray-800 font-medium">{mockRefundsData.qrCode?.substring(0, 8)}</span>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="transaction-list bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('tutorial.refunds.step2.recentTransactionsTitle')}</h2>
        
        {saleTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('tutorial.refunds.step2.noTransactionsMessage')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {saleTransactions.map((transaction: any) => (
              <div
                key={transaction.id}
                onClick={() => handleTransactionSelect(String(transaction.id))}
                className={`select-transaction-button cursor-pointer transition-all duration-150 ${
                  selectedTransactionId === String(transaction.id)
                    ? 'ring-2 ring-indigo-500 rounded-md'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800"> Transaction #{String(transaction.id).substring(0, 8)}</p>
                      <p className="text-gray-600 text-sm">{t('tutorial.refunds.step2.operatorLabel')}: {transaction.operatorName || "John"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">R{formatAmount(transaction.amount || 0)}</p>
                      <p className="text-gray-500 text-sm">
                        {transaction.createdAt ? timestampToDate(transaction.createdAt).toLocaleDateString() : t('tutorial.refunds.step2.today')}
                      </p>
                    </div>
                  </div>
                 
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    
    </FlowContainer>
  );
}

export default RefundsStep2PageTutorial;