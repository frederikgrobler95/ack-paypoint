import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AmountKeypad from '../../../../../shared/ui/AmountKeypad';
import { useTransaction } from '../../../../../queries/transactions';
import { Transaction } from '../../../../../shared/contracts/transaction';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
function RefundsStep3Page(): React.JSX.Element {
  const navigate = useNavigate();
  const { flowData } = useFlowStore();
  
  const { qrCode, idempotencyKey, transactionId } = flowData;
  
  const { data: transaction, isLoading, isError } = useTransaction(transactionId);
  const [amountString, setAmountString] = useState('0.00');
  const [amountCents, setAmountCents] = useState(0);
  
  
  // Update amount display when transaction loads
  useEffect(() => {
    if (transaction) {
      // Initialize with 0 but ensure we don't exceed the original amount
      setAmountString('0.00');
      setAmountCents(0);
    }
  }, [transaction]);
  
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };

  const handleNumberPress = (number: string) => {
    if (!transaction) return;

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
    if (newCents > transaction.amountCents) {
      // In a real implementation, we would use the AlertProvider here
      // For now, we'll just return without updating the state
      return;
    }

    setAmountString(newAmountString);
    setAmountCents(newCents);
  };

  const handleBackspacePress = () => {
    if (!transaction) return;

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
    if (amountCents <= 0 || !transaction) {
      // In a real implementation, we would use the AlertProvider here
      // For now, we'll just return without navigating
      return;
    }
    
    if (transaction && amountCents > transaction.amountCents) {
      // In a real implementation, we would use the AlertProvider here
      // For now, we'll just return without navigating
      return;
    }

    // Mark step 3 as complete
    useFlowStore.getState().setFlowData({ step: 3, amountCents });
    navigate('/sales/refunds/refundsstep4');
  };
  
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">{t('refundsStep3.loadingTransactionDetails')}</p>
        </div>
      </FlowContainer>
    );
  }
  
  if (isError || !transaction) {
    return (
      <FlowContainer withNoHeaderOffset withBottomOffset>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">{t('refundsStep3.errorLoadingTransactionDetails')}</p>
        </div>
      </FlowContainer>
    );
  }
  
  const isSubmitDisabled = amountCents <= 0 || (transaction && amountCents > transaction.amountCents);
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <div className="flex-1 flex flex-col h-full">
        
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-4 flex-shrink-0">
          <div className="text-center mb-4">
            <p className="text-gray-600">{t('refundsStep3.originalTransactionAmount')}</p>
            <p className="text-3xl font-bold text-indigo-600">{formatAmount(transaction?.amountCents || 0)}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-gray-600 text-center mb-2">{t('refundsStep3.refundAmount')}</p>
            <p className="text-4xl font-bold text-center text-gray-800">{formatAmount(amountCents)}</p>
          </div>
          
          {transaction && amountCents > transaction.amountCents && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              {t('refundsStep3.amountExceedsOriginal')}
            </div>
          )}
        </div>
        
        <div className="w-full max-w-md flex-grow flex flex-col">
          <AmountKeypad
            onNumberPress={handleNumberPress}
            onBackspacePress={handleBackspacePress}
            onClearPress={handleClearPress}
            onSubmitPress={handleSubmitPress}
            submitDisabled={isSubmitDisabled}
          />
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep3Page;