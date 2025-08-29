import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { TransactionType } from '@/shared/contracts/transaction';
import { timestampToDate } from '@/shared/utils';
import { Card } from '@/shared/ui';

// Define types for our data
interface Transaction {
  id: string;
  operatorName: string;
  customerName: string;
  amountCents: number;
  type: TransactionType;
  createdAt: Timestamp;
}

// Component for displaying individual transactions
const StallTransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const formattedAmount = (Math.abs(transaction.amountCents) / 100).toFixed(2);
  const isRefund = transaction.type === 'refund';
  const isSale = transaction.type === 'sale';
  
  // Format the time (HH:MM)
  const formattedTime = timestampToDate(transaction.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine styling based on transaction type
  const getTypeColor = () => {
    if (isRefund) return 'bg-red-100 text-red-800';
    if (isSale) return 'bg-green-100 text-green-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getTypeText = () => {
    if (isRefund) return 'Refund';
    if (isSale) return 'Sale';
    return 'Sale';
  };
  
  return (
    <Card className="p-3 mb-2 grid gap-2 items-center elevation-1 animate-fade-in" role="listitem">
      <div className="col-span-3 flex justify-start">
        <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getTypeColor()}`} aria-label={getTypeText()}>
          {getTypeText()}
        </div>
      </div>
      <div className="col-span-6">
        <p className="body-small font-bold text-gray-900 whitespace-normal break-words">{transaction.customerName}</p>
        <div className="flex items-center caption text-gray-500 flex-wrap">
          <span className="whitespace-normal break-words">{transaction.operatorName}</span>
          <span className="mx-1 flex-shrink-0">•</span>
          <span className="flex-shrink-0">{formattedTime}</span>
        </div>
      </div>
      <div className="col-span-3 flex justify-end">
        <div className={`text-sm font-semibold ${isRefund ? 'text-red-600' : 'text-green-600'}`} aria-label={isRefund ? `Refund amount: R${formattedAmount}` : `Sale amount: R${formattedAmount}`}>
          {isRefund ? '-R' : 'R'}{formattedAmount}
        </div>
      </div>
    </Card>
  );
};

export default StallTransactionCard;