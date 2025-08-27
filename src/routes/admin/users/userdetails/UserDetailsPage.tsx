import React from 'react'
import { useParams } from 'react-router-dom'


function UserDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
        </div>
        <p>User ID: {id}</p>
        <p>This is the user details page for user {id}.</p>
      </div>
    </>
  )
}

export default UserDetailsPage