import React from 'react'
import { useParams } from 'react-router-dom'
import '../../../App.css'

function UserDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div>
        <h1>User Details</h1>
        <p>User ID: {id}</p>
        <p>This is the user details page for user {id}.</p>
      </div>
    </>
  )
}

export default UserDetailsPage