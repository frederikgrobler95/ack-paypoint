import React from 'react'
import { useParams } from 'react-router-dom'
import { useAdminCreateQrCodesPdfMutation } from '../../../../../mutations/useAdminCreateQrCodesPdfMutation'
import { downloadBlob } from '../../../../../services/downloadService'


function BatchDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const mutation = useAdminCreateQrCodesPdfMutation()

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

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Batch Details</h1>
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-2">Batch ID: {id}</p>
          <p className="text-gray-600">This is the batch details page for batch {id}.</p>
        </div>
      </div>
    </>
  )
}

export default BatchDetailsPage