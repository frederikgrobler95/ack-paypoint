import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour } from '../../../components/tutorial';
import { useTutorialNavigation } from '../../../hooks';

// Define the steps for the sales tutorial
const salesTutorialSteps = [
  {
    target: '.sales-overview',
    content: 'This section shows an overview of sales data in tutorial mode.',
    disableBeacon: true,
  },
  {
    target: '.recent-transactions',
    content: 'This list shows recent transactions. In tutorial mode, these are mock transactions.',
  },
  {
    target: '.start-sale-button',
    content: 'Click this button to start a new sale. This will begin the sales tutorial flow.',
  },
  {
    target: '.tutorial-controls',
    content: 'These controls allow you to navigate through the tutorial or exit at any time.',
  },
];

function SalesPageTutorial() {
  const navigate = useNavigate();
  const { mockSalesData, setCurrentTutorial } = useTutorialStore();
  const { navigateToTutorialStep, exitTutorial } = useTutorialNavigation();
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('sales');
  }, [setCurrentTutorial]);
  
  const handleStartSale = () => {
    // Navigate to the first step of the sales tutorial
    navigateToTutorialStep('sales', 1);
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={salesTutorialSteps} />
      
      <div className="p-4">
        {/* Sales Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 sales-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Sales (Tutorial)</h2>
          <p className="text-3xl font-bold text-green-600">R{formatAmount(mockSalesData.totalSales)}</p>
          <p className="text-gray-500 text-sm mt-2">This is mock data for tutorial purposes</p>
        </div>
        
        {/* Recent Transactions */}
        <div className="mb-6 recent-transactions">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Transactions</h2>
          {mockSalesData.transactions.length > 0 ? (
            mockSalesData.transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{transaction.customerName}</p>
                    <p className="text-gray-500 text-sm">{transaction.operatorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">R{formatAmount(transaction.amountCents)}</p>
                    <p className="text-gray-500 text-sm">
                      {transaction.createdAt instanceof Date 
                        ? transaction.createdAt.toLocaleDateString() 
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              No transactions yet
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