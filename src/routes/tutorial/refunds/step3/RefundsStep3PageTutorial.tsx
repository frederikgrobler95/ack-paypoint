import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import AmountKeypad from '../../../../shared/ui/AmountKeypad';
import { useTranslation } from 'react-i18next';

function RefundsStep3PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the refunds step 3 tutorial
  const refundsStep3TutorialSteps = [
    {
      target: '.refund-amount-display',
      content: t('tutorial.refunds.step3.refundAmountDisplayContent'),
      disableBeacon: true,
    },
    {
      target: '.amount-keypad',
      content: t('tutorial.refunds.step3.amountKeypadContent'),
    },
    {
      target: '.proceed-button',
      content: t('tutorial.refunds.step3.proceedButtonContent'),
    },
  ];
  const { mockRefundsData } = useTutorialStore();
  const { setRefundsStepComplete } = useTutorialStore();
  
  const [amountString, setAmountString] = useState('0.00');
  const [amountCents, setAmountCents] = useState(0);
  
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
    if (amountCents <= 0) {
      return;
    }
    
    if (amountCents > mockRefundsData.originalAmountCents) {
      return;
    }
    
    // In tutorial mode, just show a success message and navigate to next step
    
    // Navigate to next step
    setRefundsStepComplete(3);
    navigate('/tutorial/refunds/step4');
  };
  
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep3TutorialSteps} />
      
      <div className="flex-1 flex flex-col h-full p-4">
        
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-4 flex-shrink-0 refund-amount-display">
          <div className="text-center mb-4">
            <p className="text-gray-600">{t('tutorial.refunds.step3.originalTransactionAmountLabel')}</p>
            <p className="text-3xl font-bold text-indigo-600">R{formatAmount(mockRefundsData.originalAmountCents)}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-gray-600 text-center mb-2">{t('tutorial.refunds.step3.refundAmountLabel')}</p>
            <p className="text-4xl font-bold text-center text-gray-800">R{formatAmount(amountCents)}</p>
          </div>
          
          {amountCents > mockRefundsData.originalAmountCents && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              {t('tutorial.refunds.step3.amountExceedsOriginalMessage')}
            </div>
          )}
        </div>
        
        <div className="w-full max-w-md flex-grow flex flex-col amount-keypad">
          <AmountKeypad
            onNumberPress={handleNumberPress}
            onBackspacePress={handleBackspacePress}
            onClearPress={handleClearPress}
            onSubmitPress={handleSubmitPress}
            submitDisabled={amountCents <= 0 || amountCents > mockRefundsData.originalAmountCents}
          />
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep3PageTutorial;