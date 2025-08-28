import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';
import { useToast } from '../../../../contexts/ToastContext';
import AmountKeypad from '../../../../shared/ui/AmountKeypad';

// Define the steps for the refunds step 3 tutorial
const refundsStep3TutorialSteps = [
  {
    target: '.transaction-details',
    content: 'Here you can see the details of the selected transaction that will be refunded.',
    disableBeacon: true,
  },
  {
    target: '.refund-amount-display',
    content: 'This shows the original transaction amount and the refund amount you\'re entering.',
  },
  {
    target: '.amount-keypad',
    content: 'Use this keypad to enter the refund amount. You can enter up to the original transaction amount.',
  },
  {
    target: '.refund-reason',
    content: 'Select a reason for the refund. This helps with record keeping and reporting.',
  },
  {
    target: '.proceed-button',
    content: 'Once you have set the refund amount and reason, click here to proceed to confirmation.',
  },
];

function RefundsStep3PageTutorial() {
  const navigate = useNavigate();
  const { mockRefundsData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const { showToast } = useToast();
  
  const [amountString, setAmountString] = useState('0.00');
  const [amountCents, setAmountCents] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  const handleNumberPress = (number: string) => {
    // Remove decimal point to work with raw digits
    let digits = amountString.replace('.', '');
    
    // If we're at the initial state, start fresh
    if (digits === '000') {
      digits = '';
    }
    
    // Append the new digit
    digits += number;
    
    // Prevent amounts that are too long (over R99,999.99)
    if (digits.length > 7) {
      return;
    }
    
    // Convert to a number to remove leading zeros, then back to a string
    const numericValue = parseInt(digits, 10);
    let formattedDigits = numericValue.toString();
    
    // Format the string properly with decimal point
    // Pad with leading zeros if needed to have at least 3 digits for cents
    formattedDigits = formattedDigits.padStart(3, '0');
    
    // Insert decimal point 2 positions from the end
    const insertPos = formattedDigits.length - 2;
    const newAmountString =
      formattedDigits.substring(0, insertPos) +
      '.' +
      formattedDigits.substring(insertPos);
    
    // Convert to cents
    const newCents = Math.round(parseFloat(newAmountString) * 100);
    
    // Check if the new amount exceeds the maximum allowed
    if (newCents > mockRefundsData.originalAmountCents) {
      // In a real implementation, we would use the AlertProvider here
      // For now, we'll just return without updating the state
      return;
    }
    
    setAmountString(newAmountString);
    setAmountCents(newCents);
  };
  
  const handleBackspacePress = () => {
    // Remove decimal point to work with raw digits
    let digits = amountString.replace('.', '');
    
    if (digits === '000') {
      // Already at zero, nothing to do
      return;
    } else {
      // Remove last digit
      digits = digits.substring(0, digits.length - 1);
      
      // If we've removed all digits, reset to zero
      if (digits === '' || parseInt(digits, 10) === 0) {
        setAmountString('0.00');
        setAmountCents(0);
        return;
      }
      
      // Convert to a number to remove leading zeros, then back to a string
      const numericValue = parseInt(digits, 10);
      let formattedDigits = numericValue.toString();
      
      // Pad with leading zeros if needed
      formattedDigits = formattedDigits.padStart(3, '0');
      
      // Insert decimal point 2 positions from the end
      const insertPos = formattedDigits.length - 2;
      const newAmountString =
        formattedDigits.substring(0, insertPos) +
        '.' +
        formattedDigits.substring(insertPos);
      
      // Convert to cents
      const newCents = Math.round(parseFloat(newAmountString) * 100);
      
      setAmountString(newAmountString);
      setAmountCents(newCents);
    }
  };
  
  const handleClearPress = () => {
    setAmountCents(0);
    setAmountString('0.00');
  };
  
  const handleSubmitPress = () => {
    if (!refundReason) {
      showToast('Please select a refund reason', 'error');
      return;
    }
    
    if (amountCents <= 0) {
      showToast('Refund amount must be greater than 0', 'error');
      return;
    }
    
    if (amountCents > mockRefundsData.originalAmountCents) {
      showToast('Refund amount cannot exceed original transaction amount', 'error');
      return;
    }
    
    // In tutorial mode, just show a success message and navigate to next step
    showToast('Refund details confirmed', 'success');
    
    // Navigate to next step
    navigateToNextTutorialStep(location.pathname);
  };
  
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep3TutorialSteps} />
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Enter Refund Amount</h2>
          
          {/* Transaction Details */}
          <div className="transaction-details mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">Selected Transaction</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{mockRefundsData.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Original Amount</p>
                <p className="font-medium text-green-600">R{formatAmount(mockRefundsData.originalAmountCents)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">QR Code</p>
                <p className="font-medium">{mockRefundsData.qrCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Date</p>
                <p className="font-medium">Today</p>
              </div>
            </div>
          </div>
          
          {/* Refund Amount Display */}
          <div className="refund-amount-display mb-6">
            <div className="text-center mb-4">
              <p className="text-gray-600">Original Transaction Amount</p>
              <p className="text-3xl font-bold text-indigo-600">R{formatAmount(mockRefundsData.originalAmountCents)}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-gray-600 text-center mb-2">Refund Amount</p>
              <p className="text-4xl font-bold text-center text-gray-800">R{formatAmount(amountCents)}</p>
            </div>
            
            {amountCents > mockRefundsData.originalAmountCents && (
              <div className="mt-4 text-center text-red-500 font-semibold">
                Amount exceeds original transaction
              </div>
            )}
          </div>
          
          {/* Refund Reason */}
          <div className="refund-reason mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reason *
            </label>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a reason...</option>
              <option value="customer_request">Customer Request</option>
              <option value="defective_product">Defective Product</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="duplicate_charge">Duplicate Charge</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Amount Keypad */}
        <div className="amount-keypad bg-white rounded-lg shadow-md p-4">
          <AmountKeypad
            onNumberPress={handleNumberPress}
            onBackspacePress={handleBackspacePress}
            onClearPress={handleClearPress}
            onSubmitPress={handleSubmitPress}
            submitDisabled={amountCents <= 0 || amountCents > mockRefundsData.originalAmountCents}
          />
        </div>
        
        {/* Proceed Button */}
        <div className="mt-4">
          <button
            onClick={handleSubmitPress}
            disabled={amountCents <= 0 || amountCents > mockRefundsData.originalAmountCents || !refundReason}
            className="proceed-button w-full py-3 px-4 rounded-md text-white font-semibold transition duration-200 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Proceed to Confirmation
          </button>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep3PageTutorial;