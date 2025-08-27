import React from 'react'
import { useParams } from 'react-router-dom'
import { useAdminCreateQrCodesPdfMutation } from '../../../../../mutations/useAdminCreateQrCodesPdfMutation'
import { downloadBlob } from '../../../../../services/downloadService'
import { useQRCodesByBatch } from '@/queries/qrCodes'
import { SharedList } from '@/shared/ui'
import { QRCode } from '@/shared/contracts/qrCode'
import { timestampToDate } from '@/shared/utils'

function BatchDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const mutation = useAdminCreateQrCodesPdfMutation()
  
  // Fetch QR codes for this batch
  const {
    data: qrCodesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQRCodesByBatch(id || null, 20)
  
  // Flatten paginated data
  const qrCodes = React.useMemo(() => {
    if (!qrCodesData?.pages) return []
    return qrCodesData.pages.flatMap(page => page.data)
  }, [qrCodesData])

  const handlePrintBatchPdf = async () => {
    if (!id) return;
    
    try {
      const result = await mutation.mutateAsync({ batchId: id });
      
      if (result.success && result.data) {
        // Convert base64 to blob
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Download the PDF
        downloadBlob(blob, `qr-codes-batch-${id}.pdf`);
      } else {
        console.error('Failed to generate PDF:', result.message);
        alert('Failed to generate PDF: ' + result.message);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  
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
            <h1 className="text-2xl font-bold text-gray-800">Batch Details</h1>
          </div>
          <button
            onClick={handlePrintBatchPdf}
            disabled={mutation.isPending}
            className={`py-2 px-4 rounded-md font-medium transition duration-300 ${
              mutation.isPending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {mutation.isPending ? 'Generating PDF...' : 'Print Batch PDF'}
          </button>
        </div>
        
        <SharedList
          data={qrCodes}
          renderItem={renderQrCodeItem}
          onRefresh={refetch}
          isLoading={isLoading}
          isError={isError}
          isEmpty={qrCodes.length === 0}
          emptyMessage="No QR codes found in this batch"
          errorMessage={error?.message || "Failed to load QR codes"}
          loadingMessage="Loading QR codes..."
        />
      </div>
    </>
  )
}

export default BatchDetailsPage