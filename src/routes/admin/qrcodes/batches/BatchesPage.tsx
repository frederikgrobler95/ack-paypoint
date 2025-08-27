import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQRBatches } from '@/queries/qrCodes'
import { SharedList } from '@/shared/ui'
import { QRBatch } from '@/shared/contracts/qrCode'
import { timestampToDate } from '@/shared/utils'

function BatchesPage(): React.JSX.Element {
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
  const renderBatchItem = (batch: QRBatch) => (
    <div
      className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => navigate(`/admin/qrcodes/batches/batchdetails/${batch.id}`)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{batch.batchName}</h3>
          <p className="text-sm text-gray-600">Count: {batch.count}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Created: {timestampToDate(batch.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">QR Code Batches</h1>
          </div>
          <button
            onClick={() => navigate('/admin/qrcodes/batches/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Create New Batch
          </button>
        </div>
        
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
    </>
  )
}

export default BatchesPage