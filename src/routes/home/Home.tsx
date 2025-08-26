import { useState } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { useLoading } from '../../contexts/LoadingContext'

function Home(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const { showToast } = useToast()
  const { showLoading, hideLoading, setCancelHandler } = useLoading()

  const simulateAsyncOperation = () => {
    showLoading('Processing your request...')
    
    // Set up cancel handler
    setCancelHandler(() => {
      console.log('Operation cancelled by user')
      showToast('Operation cancelled', 'warning')
    })
    
    // Simulate async operation
    const timer = setTimeout(() => {
      hideLoading()
      showToast('Operation completed successfully!', 'success')
      setCount((count) => count + 1)
    }, 3000)
    
    // Update cancel handler to clear timeout
    setCancelHandler(() => {
      clearTimeout(timer)
      console.log('Operation cancelled by user')
      showToast('Operation cancelled', 'warning')
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Vite + React + Tailwind CSS</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
        <div className="space-y-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            count is {count}
          </button>
          
          <button
            onClick={simulateAsyncOperation}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Test Toast & Loading
          </button>
          
          <button
            onClick={() => showToast('This is an info message', 'info')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Show Info Toast
          </button>
          
          <button
            onClick={() => showToast('This is a warning message', 'warning')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Show Warning Toast
          </button>
          
          <button
            onClick={() => showToast('This is an error message', 'error')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Show Error Toast
          </button>
        </div>
        <p className="mt-4 text-gray-600">
          Edit <code className="bg-gray-200 rounded px-1">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-6 text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default Home