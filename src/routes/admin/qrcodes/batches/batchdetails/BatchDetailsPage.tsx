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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
  const renderQrCodeItem = (qrCode: QRCode, index: number) => (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-[#1A202C] text-base leading-6">{qrCode.label}</h3>
          <p className="text-[#4A5568] text-sm leading-5 capitalize">Status: {qrCode.status}</p>
          {qrCode.assignedCustomerId && (
            <p className="text-[#4A5568] text-sm leading-5">Assigned to customer</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[#A0AEC0] text-xs leading-4">
            Created: {timestampToDate(qrCode.createdAt).toLocaleDateString()}
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
            onClick={handlePrintBatchPdf}
            disabled={mutation.isPending}
            className={`py-2 px-4 rounded-md font-medium transition duration-300 ${
              mutation.isPending
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-neutral-50'
            }`}
          >
            {mutation.isPending ? 'Generating PDF...' : 'Print Batch PDF'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList
          data={qrCodes}
          renderItem={renderQrCodeItem}
          onRefresh={refetch}
          hasMore={hasNextPage}
          loadMore={() => fetchNextPage()}
          isLoading={isLoading || isFetchingNextPage}
          isError={isError}
          isEmpty={qrCodes.length === 0}
          emptyMessage="No QR codes found in this batch"
          errorMessage={error?.message || "Failed to load QR codes"}
          loadingMessage="Loading QR codes..."
        />
      </div>
    </div>
  )
}

export default BatchDetailsPage