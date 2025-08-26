import React from 'react'

// Define types for our dummy data
type TransactionType = 'debit' | 'credit' | 'refund';

interface Transaction {
  id: string;
  operatorName: string;
  customerName: string;
  amountCents: number;
  type: TransactionType;
}

// Dummy data
const stallName = "Market Street Cafe";
const totalSalesCents = 125000; // R1,250.00

const transactions: Transaction[] = [
  { id: '1', operatorName: 'John Smith', customerName: 'Alice Johnson', amountCents: 25000, type: 'credit' },
  { id: '2', operatorName: 'Sarah Johnson', customerName: 'Bob Smith', amountCents: -15000, type: 'refund' },
  { id: '3', operatorName: 'Mike Williams', customerName: 'Carol Davis', amountCents: 42000, type: 'credit' },
  { id: '4', operatorName: 'Emily Davis', customerName: 'David Wilson', amountCents: 18000, type: 'debit' },
  { id: '5', operatorName: 'Robert Brown', customerName: 'Eva Martinez', amountCents: 35000, type: 'credit' },
];

// Component for displaying total sales
const TotalSalesCard: React.FC<{ totalCents: number }> = ({ totalCents }) => {
  const formattedAmount = (totalCents / 100).toFixed(2);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Sales</h2>
      <p className="text-3xl font-bold text-green-600">R{formattedAmount}</p>
    </div>
  );
};

// Component for displaying individual transactions
const TransactionCard: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
  const formattedAmount = (Math.abs(transaction.amountCents) / 100).toFixed(2);
  const isRefund = transaction.type === 'refund';
  const isDebit = transaction.type === 'debit';
  
  // Determine styling based on transaction type
  const getTypeColor = () => {
    if (isRefund) return 'bg-red-100 text-red-800';
    if (isDebit) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getTypeText = () => {
    if (isRefund) return 'Refund';
    if (isDebit) return 'Debit';
    return 'Credit';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3 flex justify-between items-center">
      <div className="flex items-center">
        <div className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor()}`}>
          {getTypeText()}
        </div>
        <div className="ml-3">
          <p className="text-lg font-bold text-gray-900">{transaction.customerName}</p>
          <p className="text-sm text-gray-500">Operator: {transaction.operatorName}</p>
        </div>
      </div>
      <div className={`text-lg font-semibold ${isRefund ? 'text-red-600' : isDebit ? 'text-yellow-600' : 'text-green-600'}`}>
        {isRefund ? '-R' : 'R'}{formattedAmount}
      </div>
    </div>
  );
};

function SalesPage(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{stallName} Sales</h1>
      <TotalSalesCard totalCents={totalSalesCents} />
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Transactions</h2>
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
      
      {/* FAB Button */}
      <div className="fixed bottom-20 right-6">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          onClick={() => {
            // Navigation to sales flow would go here
            console.log('Initiate sales flow');
          }}
        >
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
}

export default SalesPage;