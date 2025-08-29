import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminCreateQrCodesMutation } from '../../../../../mutations/useAdminCreateQrCodesMutation'
import { useQRBatches } from '@/queries/qrCodes'

function CreateBatchPage(): React.JSX.Element {
  const navigate = useNavigate()
  const mutation = useAdminCreateQrCodesMutation()
  const { data: batches } = useQRBatches()
  
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [newBatchName, setNewBatchName] = useState<string>('')
  const [amount, setAmount] = useState<number>(10)
  const [prefix, setPrefix] = useState<string>('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await mutation.mutateAsync({
        amount,
        batchId: selectedBatchId || undefined,
        name: newBatchName || undefined,
        prefix: prefix || undefined
      })
      
      console.log('Batch created successfully:', result)
      alert(`Successfully created ${result.qrCodes.length} QR codes`)
      navigate('/admin/qrcodes/batches')
    } catch (error) {
      console.error('Error creating batch:', error)
      alert('Error creating batch. Please try again.')
    }
  }
  
  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            onClick={() => navigate('/admin/qrcodes/batches')}
            className="bg-gray-500 hover:bg-gray-600 text-neutral-50 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Cancel
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add to existing batch
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Create new batch</option>
                {batches?.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchName} ({batch.count} codes)
                  </option>
                ))}
              </select>
            </div>
            
            {selectedBatchId === '' && (
              <div className="mb-6">
                <label htmlFor="batchName" className="block text-sm font-medium text-gray-700 mb-2">
                  New Batch Name
                </label>
                <input
                  type="text"
                  id="batchName"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter batch name"
                />
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of QR Codes
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                min="1"
                max="1000"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Prefix (Optional)
              </label>
              <input
                type="text"
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. BASAAR25"
              />
              <p className="mt-1 text-sm text-gray-500">
                If provided, QR codes will be prefixed with this text followed by a dash and 6 random digits.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/qrcodes/batches')}
                className="bg-gray-500 hover:bg-gray-600 text-neutral-50 font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className={`py-2 px-4 rounded-md font-medium transition duration-300 ${
                  mutation.isPending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-neutral-50'
                }`}
              >
                {mutation.isPending ? 'Creating...' : 'Create QR Codes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateBatchPage