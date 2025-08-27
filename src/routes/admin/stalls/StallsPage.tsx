import React from 'react'
import { useNavigate } from 'react-router-dom'


function StallsPage(): React.JSX.Element {
  const navigate = useNavigate()
  
  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Stalls Management</h1>
          <button
            onClick={() => {
              // TODO: Implement add new stall functionality in a future task
              console.log('Add new stall button clicked')
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Add New Stall
          </button>
        </div>
        <p>This is the stalls management page.</p>
      </div>
    </>
  )
}

export default StallsPage