import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'


function StallDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <>
      <div className="p-4">
        <div className="flex items-center mb-6">
        </div>
        <p className="mb-4">Stall ID: {id}</p>
        <p className="mb-6">This is the stall details page for stall {id}.</p>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate(`/admin/stalls/stalldetails/${id}/operators`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            Manage Operators
          </button>
          
          <button
            onClick={() => navigate(`/admin/stalls/stalldetails/${id}/stats`)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
          >
            View Statistics
          </button>
        </div>
      </div>
    </>
  )
}

export default StallDetailsPage