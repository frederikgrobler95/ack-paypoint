import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour } from '../../../components/tutorial';
import { timestampToDate } from '@/shared/utils';
import { useTranslation } from 'react-i18next';

function RefundsPageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the refunds tutorial
  const refundsTutorialSteps = [
    {
      target: '.tutorial-intro',
      content: t('tutorial.refunds.welcomeMessage'),
      disableBeacon: true,
      placement: 'bottom' as const,
    },
    {
      target: '.header-menu-button',
      content: t('tutorial.refunds.headerMenuContent'),
      placement: 'bottom' as const,
    },
    {
      target: '.refunds-menu-item',
      content: t('tutorial.refunds.refundsMenuItemContent'),
      placement: 'bottom' as const,
    },
  ];
  const { mockSalesData, setCurrentTutorial } = useTutorialStore();
  const { setRefundsStepComplete } = useTutorialStore();
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('refunds');
  }, [setCurrentTutorial]);
  
  const handleRefundsClick = () => {
    // Navigate to the first step of the refunds tutorial
    setRefundsStepComplete(1);
    navigate('/tutorial/refunds/step1');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer className='tutorial-intro' withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsTutorialSteps} />
      
      {/* Floating Header Menu Simulation */}
      <div className="fixed top-4 right-4 z-50">
        {/* Menu Button - Disabled */}
       
        
        {/* Dropdown Menu - Simplified */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-48">
          <div className="py-2">
            <div
              className="refunds-menu-item px-4 py-3 text-sm hover:bg-red-50 cursor-pointer bg-red-50 border-l-4 border-red-500"
              onClick={handleRefundsClick}
            >
              <div className="flex items-center space-x-2">
                <span className="text-red-600">↩</span>
                <span className="font-medium text-red-600">{t('tutorial.refunds.refundsButton')}</span>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center space-x-2">
               
                  <span>{t('tutorial.refunds.logoutButton')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Sales Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 sales-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('tutorial.refunds.totalSalesTitle')}</h2>
          <p className="text-3xl font-bold text-green-600">R{formatAmount(mockSalesData.totalSales)}</p>
          <p className="text-gray-500 text-sm mt-2">{t('tutorial.refunds.mockDataMessage')}</p>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6 recent-transactions">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">{t('tutorial.refunds.recentTransactionsTitle')}</h2>
          {mockSalesData.transactions.length > 0 ? (
            mockSalesData.transactions.map((transaction: any) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{transaction.customerName}</p>
                    <p className="text-gray-500 text-sm">{transaction.operatorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">R{formatAmount(transaction.amountCents)}</p>
                    <p className="text-gray-500 text-sm">
                      {transaction.createdAt ? timestampToDate(transaction.createdAt).toLocaleDateString() : t('tutorial.refunds.justNow')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              {t('tutorial.refunds.noTransactionsMessage')}
            </div>
          )}
        </div>
        
       
        
        {/* Tutorial Controls */}
        
      </div>
    
    </FlowContainer>
  );
}

export default RefundsPageTutorial;