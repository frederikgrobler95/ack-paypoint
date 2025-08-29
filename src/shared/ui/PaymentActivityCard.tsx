import React from 'react';
import { Card } from '@/shared/ui';

interface Payment {
  id: string;
  customerName: string;
  amountCents: number;
  createdAt: any; // Firebase Timestamp or Date
}

// Component for displaying individual payment activities
const PaymentActivityCard: React.FC<{ payment: Payment }> = ({ payment }) => {
  const formattedAmount = (Math.abs(payment.amountCents) / 100).toFixed(2);
  
  // Format the date
  const formattedDate = payment.createdAt 
    ? new Date(payment.createdAt.toDate ? payment.createdAt.toDate() : payment.createdAt).toLocaleDateString()
    : 'N/A';
  
  return (
    <Card className="p-3 mb-2 grid grid-cols-12 gap-2 items-center elevation-1 animate-fade-in" role="listitem">
      <div className="col-span-3 flex justify-start">
        <div className="px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800" aria-label="Payment">
          Pay
        </div>
      </div>
      <div className="col-span-6">
        <p className="body-small font-bold text-gray-900 whitespace-normal break-words">{payment.customerName}</p>
        <div className="flex items-center caption text-gray-500 flex-wrap">
          <span className="flex-shrink-0">{formattedDate}</span>
        </div>
      </div>
      <div className="col-span-3 flex justify-end">
        <div className="text-sm font-semibold text-green-600" aria-label={`Payment amount: R${formattedAmount}`}>
          R{formattedAmount}
        </div>
      </div>
    </Card>
  );
};

export default PaymentActivityCard;