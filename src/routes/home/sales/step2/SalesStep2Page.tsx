import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AmountKeypad from '../../../../shared/ui/AmountKeypad';

function SalesStep2Page(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qrCode = searchParams.get('code') || '';
  
  const [amount, setAmount] = useState('0');
  const [amountDisplay, setAmountDisplay] = useState('0');
  
  const handleNumberPress = (number: string) => {
    if (amountDisplay === '0' && number !== '.') {
      setAmountDisplay(number);
      setAmount(number);
    } else {
      const newDisplay = amountDisplay + number;
      setAmountDisplay(newDisplay);
      setAmount(newDisplay);
    }
  };
  
  const handleBackspacePress = () => {
    if (amountDisplay.length === 1) {
      setAmountDisplay('0');
      setAmount('0');
    } else {
      const newDisplay = amountDisplay.slice(0, -1);
      setAmountDisplay(newDisplay);
      setAmount(newDisplay);
    }
  };
  
  const handleClearPress = () => {
    setAmountDisplay('0');
    setAmount('0');
  };
  
  const handleSubmitPress = () => {
    if (parseFloat(amount) > 0) {
      // Convert amount to cents for consistency with the codebase
      const amountCents = Math.round(parseFloat(amount) * 100);
      navigate(`/home/sales/step3?code=${encodeURIComponent(qrCode)}&amount=${amountCents}`);
    }
  };

  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales - Step 2</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Enter Amount</h2>
          <p className="text-gray-600 mb-4">Please enter the amount for this transaction.</p>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              R {amountDisplay}
            </div>
            <div className="text-sm text-gray-500">
              QR Code: {qrCode.substring(0, 8)}...
            </div>
          </div>
          
          <AmountKeypad
            onNumberPress={handleNumberPress}
            onBackspacePress={handleBackspacePress}
            onClearPress={handleClearPress}
            onSubmitPress={handleSubmitPress}
            submitDisabled={parseFloat(amount) <= 0}
          />
        </div>
      </div>
    </>
  );
}

export default SalesStep2Page;