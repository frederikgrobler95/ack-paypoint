import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQRCodes } from '@/queries/qrCodes'
import { SharedList } from '@/shared/ui'
import { QRCode } from '@/shared/contracts/qrCode'
import { timestampToDate } from '@/shared/utils'

function QRCodesPage(): React.JSX.Element {
  const navigate = useNavigate()
  
  // Fetch QR codes data
  const {
    data: qrCodesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQRCodes(20)
  
  // Flatten paginated data
  const qrCodes = React.useMemo(() => {
    if (!qrCodesData?.pages) return []
    return qrCodesData.pages.flatMap(page => page.data)
  }, [qrCodesData])
  
  // Render individual QR code item
  const renderQrCodeItem = (qrCode: QRCode) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{qrCode.label}</h3>
          <p className="text-sm text-gray-600 capitalize">Status: {qrCode.status}</p>
          {qrCode.assignedCustomerId && (
            <p className="text-sm text-gray-600">Assigned to customer</p>
          )}
          {qrCode.batchId && (
            <p className="text-sm text-gray-600">Batch: {qrCode.batchId.substring(0, 8)}...</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Created: {timestampToDate(qrCode.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">QR Codes</h1>
          <button
            onClick={() => navigate('/admin/qrcodes/batches')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Batches
          </button>
        </div>
        
        <SharedList
          data={qrCodes}
          renderItem={renderQrCodeItem}
          onRefresh={refetch}
          isLoading={isLoading}
          isError={isError}
          isEmpty={qrCodes.length === 0}
          emptyMessage="No QR codes found"
          errorMessage={error?.message || "Failed to load QR codes"}
          loadingMessage="Loading QR codes..."
        />
      </div>
    </>
  )
}

export default QRCodesPage