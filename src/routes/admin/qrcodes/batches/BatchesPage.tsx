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
  const renderBatchItem = (batch: QRBatch, index: number) => (
    <div
      className="p-4 cursor-pointer"
      onClick={() => navigate(`/admin/qrcodes/batches/batchdetails/${batch.id}`)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-[#1A202C] text-base leading-6">{batch.batchName}</h3>
          <p className="text-[#4A5568] text-sm leading-5">Count: {batch.count}</p>
        </div>
        <div className="text-right">
          <p className="text-[#A0AEC0] text-xs leading-4">
            Created: {timestampToDate(batch.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            onClick={() => navigate('/admin/qrcodes/batches/create')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
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

export default BatchesPage