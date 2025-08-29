import React from 'react';
import { Card } from '@/shared/ui';

interface Registration {
  id: string;
  customerName: string;
  createdAt: any; // Firebase Timestamp or Date
}

// Component for displaying individual registration activities
const RegistrationActivityCard: React.FC<{ registration: Registration }> = ({ registration }) => {
  // Format the date
  const formattedDate = registration.createdAt 
    ? new Date(registration.createdAt.toDate ? registration.createdAt.toDate() : registration.createdAt).toLocaleDateString()
    : 'N/A';
  
  return (
    <Card className="p-3 mb-2 grid  gap-2 items-center elevation-1 animate-fade-in" role="listitem">
      <div className="col-span-3 flex justify-start">
        <div className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800" aria-label="Registration">
          Reg
        </div>
      </div>
      <div className="col-span-6">
        <p className="body-small font-bold text-gray-900 whitespace-normal break-words">{registration.customerName}</p>
        <div className="flex items-center caption text-gray-500 flex-wrap">
          <span className="flex-shrink-0">{formattedDate}</span>
        </div>
      </div>
      <div className="col-span-3 flex justify-end">
        <div className="text-sm font-semibold text-blue-600" aria-label={`Registration`}>
          Registered
        </div>
      </div>
    </Card>
  );
};

export default RegistrationActivityCard;