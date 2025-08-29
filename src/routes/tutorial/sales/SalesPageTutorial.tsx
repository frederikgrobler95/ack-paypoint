import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { useWorkStore } from '@/shared/stores/workStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour, TutorialInfo } from '../../../components/tutorial';
import { timestampToDate } from '../../../shared/utils';
import { useTranslation } from 'react-i18next';

function SalesPageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the sales tutorial
  const salesTutorialSteps = [
    {
      target: '.sales-overview',
      content: t('tutorial.sales.overviewContent'),
      disableBeacon: true,
    },
    {
      target: '.recent-transactions',
      content: t('tutorial.sales.recentTransactionsContent'),
    },
    {
      target: '.start-sale-button',
      content: t('tutorial.sales.startSaleButtonContent'),
    },
    {
      target: '.tutorial-controls',
      content: t('tutorial.sales.tutorialControlsContent'),
    },
  ];
  const { mockSalesData, setCurrentTutorial } = useTutorialStore();
  const { currentStall } = useWorkStore();
  const { setSalesStepComplete } = useTutorialStore();
  const [showInfo, setShowInfo] = useState(true);
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('sales');
  }, [setCurrentTutorial]);
  
  const handleStartTutorial = () => {
    setShowInfo(false);
  };
  
  const handleStartSale = () => {
    // Navigate to the first step of the sales tutorial
    setSalesStepComplete(1);
    navigate('/tutorial/sales/step1');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  // If showInfo is true, render the TutorialInfo component
  if (showInfo) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <TutorialInfo
          title={t('tutorial.sales.welcomeTitle')}
          description={t('tutorial.sales.welcomeDescription')}
          assignedStall="Sales"
          assignedStallName={currentStall?.name || t('tutorial.sales.unknownStall')}
          onStart={handleStartTutorial}
        />
      </FlowContainer>
    );
  }
  
  // Otherwise, render the main page content
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={salesTutorialSteps} />
      
      <div className="p-4">
        {/* Sales Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 sales-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('tutorial.sales.totalSalesTitle')}</h2>
          <p className="text-3xl font-bold text-green-600">R{formatAmount(mockSalesData.totalSales)}</p>
          <p className="text-gray-500 text-sm mt-2">{t('tutorial.sales.mockDataMessage')}</p>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6 recent-transactions">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('tutorial.sales.recentTransactionsTitle')}</h2>
          {mockSalesData.transactions.length > 0 ? (
            mockSalesData.transactions.map((transaction: any) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 whitespace-normal break-words">{transaction.customerName}</p>
                    <p className="text-gray-500 text-sm whitespace-normal break-words">{transaction.operatorName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-gray-800">R{formatAmount(transaction.amountCents)}</p>
                    <p className="text-gray-500 text-sm">
                      {transaction.createdAt ? timestampToDate(transaction.createdAt).toLocaleDateString() : t('tutorial.sales.justNow')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              {t('tutorial.sales.noTransactionsMessage')}
            </div>
          )}
        </div>
        
        {/* Start Sale Button */}
        <div className="fixed bottom-20 right-6">
          <button
            className="start-sale-button bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleStartSale}
          >
            <span className="text-xl">+</span>
          </button>
        </div>
        
        {/* Tutorial Controls */}
        
      </div>
    </FlowContainer>
  );
}

export default SalesPageTutorial;