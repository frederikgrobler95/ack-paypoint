import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { FlowContainer } from '../../../shared/ui';
import { TutorialTour } from '../../../components/tutorial';
import { useTutorialNavigation } from '../../../hooks';

// Define the steps for the checkout tutorial
const checkoutTutorialSteps = [
  {
    target: '.checkout-overview',
    content: 'This section shows an overview of checkout data in tutorial mode.',
    disableBeacon: true,
  },
  {
    target: '.recent-payments',
    content: 'This list shows recent payments. In tutorial mode, these are mock payments.',
  },
  {
    target: '.start-checkout-button',
    content: 'Click this button to start a new checkout. This will begin the checkout tutorial flow.',
  },
  {
    target: '.tutorial-controls',
    content: 'These controls allow you to navigate through the tutorial or exit at any time.',
  },
];

function CheckoutPageTutorial() {
  const navigate = useNavigate();
  const { mockCheckoutData, setCurrentTutorial } = useTutorialStore();
  const { navigateToTutorialStep, exitTutorial } = useTutorialNavigation();
  
  // Set current tutorial when component mounts
  React.useEffect(() => {
    setCurrentTutorial('checkout');
  }, [setCurrentTutorial]);
  
  const handleStartCheckout = () => {
    // Navigate to the first step of the checkout tutorial
    navigateToTutorialStep('checkout', 1);
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutTutorialSteps} />
      
      <div className="p-4">
        {/* Checkout Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 checkout-overview">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue (Tutorial)</h2>
          <p className="text-3xl font-bold text-green-600">R{formatAmount(mockCheckoutData.totalRevenue)}</p>
          <p className="text-gray-500 text-sm mt-2">This is mock data for tutorial purposes</p>
        </div>
        
        {/* Recent Payments */}
        <div className="mb-6 recent-payments">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Payments</h2>
          {mockCheckoutData.payments.length > 0 ? (
            mockCheckoutData.payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-4 mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{payment.customerName}</p>
                    <p className="text-gray-500 text-sm">{payment.operatorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">R{formatAmount(payment.amountCents)}</p>
                    <p className="text-gray-500 text-sm">
                      {payment.createdAt instanceof Date 
                        ? payment.createdAt.toLocaleDateString() 
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 text-center text-gray-500">
              No payments yet
            </div>
          )}
        </div>
        
        {/* Start Checkout Button */}
        <div className="fixed bottom-20 right-6">
          <button
            className="start-checkout-button bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleStartCheckout}
          >
            <span className="text-xl">+</span>
          </button>
        </div>
        
        {/* Tutorial Controls */}
       
      </div>
    </FlowContainer>
  );
}

export default CheckoutPageTutorial;