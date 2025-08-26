import React from 'react'

// Define types for our dummy data
interface Transaction {
  id: string;
  customerName?: string;
  items: number;
  amountCents: number;
  timestamp: string;
}

// Dummy data
const stallName = "Market Street Cafe";
const totalRevenueCents = 865000; // R8,650.00

const transactions: Transaction[] = [
  { id: '1', customerName: 'Alice Johnson', items: 3, amountCents: 25000, timestamp: '2025-08-26 14:30' },
  { id: '2', items: 1, amountCents: 15000, timestamp: '2025-08-26 14:25' },
  { id: '3', customerName: 'Carol Davis', items: 5, amountCents: 42000, timestamp: '2025-08-26 14:15' },
  { id: '4', customerName: 'David Wilson', items: 2, amountCents: 18000, timestamp: '2025-08-26 14:10' },
  { id: '5', items: 4, amountCents: 35000, timestamp: '2025-08-26 14:05' },
];

// Component for displaying total revenue
const TotalRevenueCard: React.FC<{ totalCents: number }> = ({ totalCents }) => {
  const formattedAmount = (totalCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h2>
      <p className="text-3xl font-bold text-green-600">R{formattedAmount}</p>
    </div>
  );
};

// Component for displaying individual transactions
const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const formattedAmount = (transaction.amountCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
        <div className="ml-3">
          <p className="text-lg font-bold text-gray-900">
            {transaction.customerName || `Customer ${transaction.id}`}
          </p>
          <p className="text-sm text-gray-500">{transaction.items} items</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-green-600">R{formattedAmount}</div>
        <div className="text-sm text-gray-500">{transaction.timestamp}</div>
      </div>
    </div>
  );
};

function CheckoutPage(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{stallName} Checkout</h1>
      <TotalRevenueCard totalCents={totalRevenueCents} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Transactions</h2>
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Navigation to checkout flow would go here
            console.log('Initiate checkout flow');
          }}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

export default CheckoutPage;