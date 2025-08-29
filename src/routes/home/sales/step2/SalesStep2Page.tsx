import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AmountKeypad from '../../../../shared/ui/AmountKeypad';
import { FlowContainer } from '../../../../shared/ui';
import { useFlowStore } from '../../../../shared/stores/flowStore';

function SalesStep2Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { flowData, setFlowData } = useFlowStore();
  
  const [amountString, setAmountString] = useState('0.00');
  const [amountCents, setAmountCents] = useState(0);
  
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
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
      // In a real implementation, we would use the AlertProvider here
      // For now, we'll just return without navigating
      return;
    }

    // Save flow data and mark step 2 as complete
    setFlowData({ ...flowData, step: 2, amountCents });

    navigate('/sales/salesstep3');
  };

  return (
    <>
      <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton smallCancelButton>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              R {amountString}
            </div>
        
          </div>
          
          <div className="flex-grow flex flex-col">
            <AmountKeypad
              onNumberPress={handleNumberPress}
              onBackspacePress={handleBackspacePress}
              onClearPress={handleClearPress}
              onSubmitPress={handleSubmitPress}
              submitDisabled={parseFloat(amountString) <= 0}
              submitText={t('salesStep2.confirmAmount')}
            />
          </div>
        </div>
      </FlowContainer>
    </>
  );
}

export default SalesStep2Page;