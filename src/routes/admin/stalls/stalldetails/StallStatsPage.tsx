import React from 'react'
import { useParams } from 'react-router-dom'
import { useStall } from '@/queries/stalls'
import { useTransactionsByStall } from '@/queries/transactions'
import { useRegistrationsByStall } from '@/queries/registrations'
import { usePaymentsByStall } from '@/queries/payments'
import { useAdminCreateStallsReportMutation } from '@/mutations/useAdminCreateStallsReportMutation'
import { downloadBlob } from '@/services/downloadService'
import { timestampToDate } from '@/shared/utils'
import StallTransactionCard from '@/shared/ui/StallTransactionCard'
import RegistrationActivityCard from '@/shared/ui/RegistrationActivityCard'
import PaymentActivityCard from '@/shared/ui/PaymentActivityCard'

function StallStatsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { data: stall, isLoading: isStallLoading, error: stallError } = useStall(id!)
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    error: transactionsError
  } = useTransactionsByStall(id!, 20)
  
  const {
    data: registrationsData,
    isLoading: isRegistrationsLoading,
    error: registrationsError
  } = useRegistrationsByStall(id!, 20)
  
  const {
    data: paymentsData,
    isLoading: isPaymentsLoading,
    error: paymentsError
  } = usePaymentsByStall(id!, 20)
  
  const { mutate: createStallReport, isPending: isCreatingReport } = useAdminCreateStallsReportMutation()
  
  // Flatten the paginated transaction data
  const flatTransactions = React.useMemo(() => {
    return transactionsData?.pages.flatMap((page: any) => page.data || []) || []
  }, [transactionsData])
  
  const flatRegistrations = React.useMemo(() => {
    return registrationsData?.pages.flatMap((page: any) => page.data || []) || []
  }, [registrationsData])
  
  const flatPayments = React.useMemo(() => {
    return paymentsData?.pages.flatMap((page: any) => page.data || []) || []
  }, [paymentsData])
  
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
  
  if (isStallLoading || isTransactionsLoading || isRegistrationsLoading || isPaymentsLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <p className="text-gray-600">Loading stall statistics...</p>
        </div>
      </div>
    )
  }
  
  if (stallError || transactionsError || registrationsError || paymentsError) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">
            Failed to load stall statistics: {(stallError as Error)?.message || (transactionsError as Error)?.message || (registrationsError as Error)?.message || (paymentsError as Error)?.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          onClick={handleExportReport}
          disabled={isCreatingReport}
          className="bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50"
        >
          {isCreatingReport ? 'Generating...' : 'Export Report'}
        </button>
      </div>
      
      {stall && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{stall.name} Statistics</h2>
          {stall.type === 'commerce' ? (
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
          ) : stall.type === 'registration' ? (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Total Customers Registered</h3>
                <p className="text-2xl font-bold text-blue-600">{flatRegistrations.length}</p>
              </div>
            </div>
          ) : stall.type === 'checkout' ? (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">Total Payments Created</h3>
                <p className="text-2xl font-bold text-green-600">{flatPayments.length}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        {stall?.type === 'commerce' ? (
          flatTransactions.length === 0 ? (
            <p className="text-gray-500">No transactions found for this stall.</p>
          ) : (
            <div className="space-y-2">
              {flatTransactions.slice(0, 10).map((transaction: any) => (
                <StallTransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )
        ) : stall?.type === 'registration' ? (
          flatRegistrations.length === 0 ? (
            <p className="text-gray-500">No registrations found for this stall.</p>
          ) : (
            <div className="space-y-2">
              {flatRegistrations.slice(0, 10).map((registration: any) => (
                <RegistrationActivityCard key={registration.id} registration={registration} />
              ))}
            </div>
          )
        ) : stall?.type === 'checkout' ? (
          flatPayments.length === 0 ? (
            <p className="text-gray-500">No payments found for this stall.</p>
          ) : (
            <div className="space-y-2">
              {flatPayments.slice(0, 10).map((payment: any) => (
                <PaymentActivityCard key={payment.id} payment={payment} />
              ))}
            </div>
          )
        ) : (
          <p className="text-gray-500">No activity found for this stall.</p>
        )}
      </div>
    </div>
  )
}

export default StallStatsPage