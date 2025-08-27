import React from 'react'
import { useParams } from 'react-router-dom'


function UserDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div className="p-4">
        <div className="flex items-center mb-6">
        </div>
        <p>User ID: {id}</p>
        <p>This is the user details page for user {id}.</p>
      </div>
    </>
  )
}

export default UserDetailsPage