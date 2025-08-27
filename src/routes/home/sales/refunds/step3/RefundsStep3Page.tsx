import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AmountKeypad from '../../../../../shared/ui/AmountKeypad';
import { useTransaction } from '../../../../../queries/transactions';
import { Transaction } from '../../../../../shared/contracts/transaction';

function RefundsStep3Page(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const qrCode = searchParams.get('code') || '';
  const transactionId = searchParams.get('transactionId') || '';
  
  const { data: transaction, isLoading, isError } = useTransaction(transactionId);
  const [amountDisplay, setAmountDisplay] = useState('0');
  const [amountCents, setAmountCents] = useState(0);
  
  // Update amount display when transaction loads
  useEffect(() => {
    if (transaction) {
      // Initialize with 0 but ensure we don't exceed the original amount
      setAmountDisplay('0');
      setAmountCents(0);
    }
  }, [transaction]);
  
  const handleNumberPress = (number: string) => {
    if (!transaction) return;
    
    const newAmountDisplay = amountDisplay === '0' ? number : amountDisplay + number;
    const newAmountCents = parseInt(newAmountDisplay, 10);
    
    // Check if the new amount exceeds the original transaction amount
    if (newAmountCents <= transaction.amountCents) {
      setAmountDisplay(newAmountDisplay);
      setAmountCents(newAmountCents);
    }
  };
  
  const handleBackspacePress = () => {
    if (amountDisplay.length === 1) {
      setAmountDisplay('0');
      setAmountCents(0);
    } else {
      const newAmountDisplay = amountDisplay.slice(0, -1);
      setAmountDisplay(newAmountDisplay);
      setAmountCents(parseInt(newAmountDisplay, 10));
    }
  };
  
  const handleClearPress = () => {
    setAmountDisplay('0');
    setAmountCents(0);
  };
  
  const handleSubmitPress = () => {
    if (amountCents > 0 && transaction) {
      navigate(`/home/sales/refunds/step4?code=${encodeURIComponent(qrCode)}&transactionId=${encodeURIComponent(transactionId)}&amount=${amountCents}`);
    }
  };
  
  // Format amount for display (in Rands)
  const formatAmount = (cents: number) => {
    const rands = cents / 100;
    return rands.toFixed(2);
  };
  
  if (isLoading) {
    return <div>Loading transaction details...</div>;
  }
  
  if (isError || !transaction) {
    return <div>Error loading transaction details. Please try again.</div>;
  }
  
  const isSubmitDisabled = amountCents <= 0 || amountCents > transaction.amountCents;
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Enter Refund Amount</h1>
        
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-gray-600">Original Transaction Amount</p>
            <p className="text-3xl font-bold text-indigo-600">R {formatAmount(transaction.amountCents)}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-gray-600 text-center mb-2">Refund Amount</p>
            <p className="text-4xl font-bold text-center text-gray-800">R {formatAmount(amountCents)}</p>
          </div>
          
          {amountCents > transaction.amountCents && (
            <div className="mt-4 text-center text-red-500 font-semibold">
              Amount exceeds original transaction
            </div>
          )}
        </div>
        
        <div className="w-full max-w-md">
          <AmountKeypad
            onNumberPress={handleNumberPress}
            onBackspacePress={handleBackspacePress}
            onClearPress={handleClearPress}
            onSubmitPress={handleSubmitPress}
            submitDisabled={isSubmitDisabled}
          />
        </div>
      </div>
    </div>
  );
}

export default RefundsStep3Page;