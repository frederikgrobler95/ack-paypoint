import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomer } from '@/queries/customers'
import { useTransactionsByCustomer } from '@/queries/transactions'
import { useQRCode } from '@/queries/qrCodes'
import { Transaction } from '@/shared/contracts/transaction'
import { SharedList } from '@/shared/ui'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

// Helper function to format currency
const formatAmount = (cents: number): string => {
  return `R${(cents / 100).toFixed(2)}`;
};

// Transaction Item Component
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="p-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <h3 className="font-medium text-gray-900 truncate">{transaction.stallName || 'Unknown Stall'}</h3>
            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              transaction.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {transaction.type}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Operator: {transaction.operatorName}</p>
          <p className="text-sm text-gray-500">
            {format(transaction.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="ml-4 text-right">
          <p className={`text-lg font-medium ${
            transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'sale' ? '+' : '-'}{formatAmount(transaction.amountCents)}
          </p>
        </div>
      </div>
    </div>
  );
};


function CustomerDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: customer, isLoading: isCustomerLoading, error: customerError } = useCustomer(id || '', {
    staleTime: 0,
    refetchOnMount: true,
  });
  const { data: qrCode, isLoading: isQrCodeLoading, error: qrCodeError } = useQRCode(customer?.qrCodeId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTransactionsByCustomer(id || '', 1000); // Fetch up to 1000 transactions to ensure we get all

  // Flatten transactions data from infinite query
  const allTransactions = React.useMemo(() => {
    return transactionsData?.pages.flatMap(page => page.data) || [];
  }, [transactionsData]);
  
  // Filter transactions based on search term
  const transactions = React.useMemo(() => {
    if (!searchTerm) return allTransactions;
    
    return allTransactions.filter(transaction =>
      transaction.stallName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.operatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTransactions, searchTerm]);

  // Handle load more transactions
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  if (isCustomerLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (customerError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-800">Error loading customer: {(customerError as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          {customer && (
            <button
              onClick={() => navigate(`/admin/customers/reissue-qr-screen/${id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Reissue QR Code
            </button>
          )}
        </div>
        
        {customer ? (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Customer Information</h2>
                  <p className="text-gray-600"><span className="font-medium">Name:</span> {customer.name}</p>
                  <p className="text-gray-600"><span className="font-medium">Phone:</span> {customer.phone}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Account Information</h2>
                  <p className="text-gray-600"><span className="font-medium">QR Label:</span> {qrCode?.label || 'None'}</p>
                  <p className="text-gray-600">
                    <span className="font-medium">Account Status:</span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.Account.status === 'paid' ? 'bg-green-100 text-green-800' :
                      customer.Account.status === 'unpaid' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.Account.status}
                    </span>
                  </p>
                  <p className="text-gray-600"><span className="font-medium">Account Balance:</span> {formatAmount(customer.Account.balanceCents)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-800">{t('customerDetails.transactionHistory')}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm ? (
                    <>
                      {t('customerDetails.showingFilteredTransactions', {
                        count: transactions.length,
                        transaction: transactions.length === 1 ? 'transaction' : 'transactions'
                      })}
                      {allTransactions.length > transactions.length && (
                        <span> {t('customerDetails.filteredFromTotal', {
                          total: allTransactions.length
                        })}</span>
                      )}
                    </>
                  ) : (
                    t('customerDetails.showingTransactions', {
                      count: transactions.length,
                      transaction: transactions.length === 1 ? 'transaction' : 'transactions'
                    })
                  )}
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isTransactionsLoading && transactions.length === 0 ? (
                <div className="p-6">
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                </div>
              ) : transactionsError ? (
                <div className="p-6">
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-sm text-red-800">Error loading transactions: {(transactionsError as Error).message}</p>
                  </div>
                </div>
              ) : transactions.length > 0 ? (
                <SharedList<Transaction>
                  data={transactions}
                  renderItem={(transaction) => <TransactionItem transaction={transaction} />}
                  hasMore={hasNextPage}
                  loadMore={handleLoadMore}
                  isLoading={isFetchingNextPage}
                  skeletonCount={5}
                />
              ) : (
                <div className="p-6">
                  <p className="text-gray-500 text-center py-8">{t('customerDetails.noTransactions')}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Customer not found.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default CustomerDetailsPage