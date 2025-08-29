import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQRBatches } from '@/queries/qrCodes'
import { SharedList } from '@/shared/ui'
import { QRBatch } from '@/shared/contracts/qrCode'
import { timestampToDate } from '@/shared/utils'

function QRCodesPage(): React.JSX.Element {
  const navigate = useNavigate()
  
  // Fetch QR batches data
  const {
    data: batches,
    isLoading,
    isError,
    error,
    refetch
  } = useQRBatches()
  
  // Render individual batch item
  const renderBatchItem = (batch: QRBatch, index: number) => (
    <div
      className="p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
      onClick={() => navigate(`/admin/qrcodes/batches/batchdetails/${batch.id}`)}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <div className="ml-4 min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-base truncate">{batch.batchName}</h3>
          <div className="flex items-center mt-1">
            <span className="text-gray-500 text-sm">Count: {batch.count}</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-gray-500 text-sm">
              Created: {timestampToDate(batch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="ml-2">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">QR Codes</h1>
          <p className="text-gray-500 text-sm">Manage QR code batches</p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/admin/qrcodes/batches/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-neutral-50 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Batch
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList
          data={batches || []}
          renderItem={renderBatchItem}
          onRefresh={refetch}
          isLoading={isLoading}
          isError={isError}
          isEmpty={!batches || batches.length === 0}
          emptyMessage="No QR code batches found"
          errorMessage={error?.message || "Failed to load QR code batches"}
          loadingMessage="Loading QR code batches..."
        />
      </div>
    </div>
  )
}

export default QRCodesPage