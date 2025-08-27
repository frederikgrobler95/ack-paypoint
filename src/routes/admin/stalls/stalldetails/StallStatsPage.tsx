import React from 'react'
import { useParams } from 'react-router-dom'
import { useStall } from '@/queries/stalls'
import { useTransactionsByStall } from '@/queries/transactions'
import { useAdminCreateStallsReportMutation } from '@/mutations/useAdminCreateStallsReportMutation'
import { downloadBlob } from '@/services/downloadService'

function StallStatsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data: stall, isLoading: isStallLoading, error: stallError } = useStall(id!)
  const { 
    data: transactionsData, 
    isLoading: isTransactionsLoading, 
    error: transactionsError 
  } = useTransactionsByStall(id!, 20)
  
  const { mutate: createStallReport, isPending: isCreatingReport } = useAdminCreateStallsReportMutation()
  
  // Flatten the paginated transaction data
  const flatTransactions = React.useMemo(() => {
    return transactionsData?.pages.flatMap((page: any) => page.data || []) || []
  }, [transactionsData])
  
  // Calculate statistics
  const totalSales = React.useMemo(() => {
    if (!flatTransactions) return 0
    return flatTransactions
      .filter((t: any) => t.type === 'sale')
      .reduce((sum: any, transaction: any) => sum + (transaction.amountCents / 100), 0)
  }, [flatTransactions])
  
  const totalRefunds = React.useMemo(() => {
    if (!flatTransactions) return 0
    return flatTransactions
      .filter((t: any) => t.type === 'refund')
      .reduce((sum: any, transaction: any) => sum + (transaction.amountCents / 100), 0)
  }, [flatTransactions])
  
  const netSales = totalSales - totalRefunds
  
  const handleExportReport = () => {
    if (!id) return
    
    createStallReport({ stallIds: [id] }, {
      onSuccess: (data: any) => {
        if (data.success && data.data) {
          // Convert base64 to blob
          const byteCharacters = atob(data.data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'application/pdf' })
          
          // Download the PDF
          downloadBlob(blob, `stall-${id}-report.pdf`)
        }
      }
    })
  }
  
  if (isStallLoading || isTransactionsLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p className="text-gray-600">Loading stall statistics...</p>
        </div>
      </div>
    )
  }
  
  if (stallError || transactionsError) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">
            Failed to load stall statistics: {(stallError as Error)?.message || (transactionsError as Error)?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Stall Statistics</h1>
        </div>
        <button
          onClick={handleExportReport}
          disabled={isCreatingReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50"
        >
          {isCreatingReport ? 'Generating...' : 'Export Report'}
        </button>
      </div>
      
      {stall && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{stall.name} Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Total Sales</h3>
              <p className="text-2xl font-bold text-blue-600">R{totalSales.toFixed(2)}</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">Total Refunds</h3>
              <p className="text-2xl font-bold text-red-600">R{totalRefunds.toFixed(2)}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">Net Sales</h3>
              <p className="text-2xl font-bold text-green-600">R{netSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        {flatTransactions.length === 0 ? (
          <p className="text-gray-500">No transactions found for this stall.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flatTransactions.slice(0, 10).map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'sale' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R{(transaction.amountCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StallStatsPage