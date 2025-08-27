import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminCreateQrCodesMutation } from '../../../mutations/useAdminCreateQrCodesMutation'

interface CustomerData {
  name: string
  email?: string
  phone?: string
}

function GenerateScreen(): React.JSX.Element {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mutation = useAdminCreateQrCodesMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    setSuccess(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0] || null
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
      setError(null)
      setSuccess(null)
    } else {
      setError('Please drop a valid CSV file.')
    }
  }

  const parseCSV = (csvText: string): CustomerData[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '')
    if (lines.length <= 1) return [] // No data or only header

    const headers = lines[0].split(',').map(header => header.trim())
    const nameIndex = headers.findIndex(header => 
      header.toLowerCase().includes('name')
    )
    
    if (nameIndex === -1) {
      throw new Error('CSV must contain a "name" column')
    }

    const emailIndex = headers.findIndex(header => 
      header.toLowerCase().includes('email')
    )
    
    const phoneIndex = headers.findIndex(header => 
      header.toLowerCase().includes('phone')
    )

    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim())
      return {
        name: values[nameIndex] || '',
        email: emailIndex !== -1 ? values[emailIndex] : undefined,
        phone: phoneIndex !== -1 ? values[phoneIndex] : undefined
      }
    }).filter(customer => customer.name.trim() !== '') // Filter out empty names
  }

  const handleGenerate = async () => {
    if (!file) {
      setError('Please select a CSV file.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setSuccess(null)

    try {
      const text = await file.text()
      const customers = parseCSV(text)
      
      if (customers.length === 0) {
        throw new Error('No valid customer data found in CSV file.')
      }

      // Process customers in batches to avoid overwhelming the system
      const batchSize = 50
      let totalGenerated = 0

      for (let i = 0; i < customers.length; i += batchSize) {
        const batch = customers.slice(i, i + batchSize)
        
        // Create QR codes for this batch
        await mutation.mutateAsync({
          amount: batch.length,
          name: `Batch ${Math.floor(i / batchSize) + 1} - ${new Date().toISOString().split('T')[0]}`
        })
        
        totalGenerated += batch.length
      }

      setSuccess(`Successfully generated ${totalGenerated} QR codes from ${customers.length} customers.`)
    } catch (err) {
      console.error('Error generating QR codes:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setError(null)
    setSuccess(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
            <h1 className="text-2xl font-bold text-gray-800">Generate QR Codes</h1>
          </div>
          <button
            onClick={() => navigate('/admin/qrcodes')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Back to QR Codes
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Generate QR Codes from CSV</h2>
          <p className="text-gray-600 mb-6">
            Upload a CSV file containing customer data to generate QR codes in bulk. 
            The CSV should contain at least a "name" column.
          </p>

          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,text/csv"
              className="hidden"
            />
            {file ? (
              <div>
                <p className="text-green-600 font-medium">File selected: {file.name}</p>
                <p className="text-gray-500 text-sm mt-2">Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag and drop a CSV file here, or click to select</p>
                <p className="text-gray-400 text-sm">CSV should contain customer data with at least a "name" column</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleGenerate}
              disabled={isProcessing || !file}
              className={`py-2 px-6 rounded-md font-medium transition duration-300 ${
                isProcessing || !file
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isProcessing ? 'Generating...' : 'Generate QR Codes'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className={`py-2 px-6 rounded-md font-medium transition duration-300 ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">CSV Format Instructions</h2>
          <p className="text-gray-600 mb-4">
            Your CSV file should follow this format:
          </p>
          <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
            <p>name,email,phone</p>
            <p>John Doe,john@example.com,1234567890</p>
            <p>Jane Smith,jane@example.com,0987654321</p>
          </div>
          <p className="text-gray-600 mt-4">
            Only the "name" column is required. Email and phone are optional.
          </p>
        </div>
      </div>
    </>
  )
}

export default GenerateScreen