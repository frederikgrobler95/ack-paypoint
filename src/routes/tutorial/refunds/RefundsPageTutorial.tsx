import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour } from '../../../components/tutorial';
import { useTutorialNavigation } from '../../../hooks';

// Define the steps for the refunds tutorial
const refundsTutorialSteps = [
  {
    target: '.tutorial-intro',
    content: 'Welcome to the refunds tutorial! This will guide you through the refund process.',
    disableBeacon: true,
    placement: 'bottom' as const,
  },
  {
    target: '.header-menu-button',
    content: 'First, you need to access the dropdown menu in the header. Click on the menu button.',
    placement: 'bottom' as const,
  },
  {
    target: '.refunds-menu-item',
    content: 'Now click on "Refunds" to start the refund process.',
    placement: 'bottom' as const,
  },
];

function RefundsPageTutorial() {
  const navigate = useNavigate();
  const { mockRefundsData, setCurrentTutorial } = useTutorialStore();
  const { navigateToTutorialStep, exitTutorial } = useTutorialNavigation();
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('refunds');
  }, [setCurrentTutorial]);
  
  const handleRefundsClick = () => {
    // Navigate to the first step of the refunds tutorial
    navigateToTutorialStep('refunds', 1);
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer className='tutorial-intro' withHeaderOffset withBottomOffset>
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
                <span className="font-medium text-red-600">Refunds</span>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center space-x-2">
               
                  <span>Logout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Tutorial Introduction */}
        
        {/* Refunds Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Refunds (Tutorial)</h2>
          <p className="text-3xl font-bold text-red-600">R{formatAmount(mockRefundsData.totalRefunds)}</p>
          <p className="text-gray-500 text-sm mt-2">This is mock data for tutorial purposes</p>
        </div>
        
        {/* Recent Refunds */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Refund Transactions</h2>
          {mockRefundsData.transactions.length > 0 ? (
            mockRefundsData.transactions.filter(t => t.type === 'refund').map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{transaction.customerName}</p>
                    <p className="text-gray-500 text-sm">{transaction.operatorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-R{formatAmount(transaction.amountCents)}</p>
                    <p className="text-gray-500 text-sm">
                      {transaction.createdAt instanceof Date
                        ? transaction.createdAt.toLocaleDateString()
                        : 'Just now'}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Refund
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              No refund transactions yet
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay to disable header interactions */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-16 bg-black bg-opacity-20"></div>
      </div>
      
      {/* Additional overlay specifically for header menu button */}
      <div className="fixed top-0 right-0 w-20 h-16 z-45 bg-transparent pointer-events-auto cursor-not-allowed"></div>
    </FlowContainer>
  );
}

export default RefundsPageTutorial;