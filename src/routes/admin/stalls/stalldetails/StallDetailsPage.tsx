import React from 'react'
import { useParams } from 'react-router-dom'


function StallDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div>
        <h1>Stall Details</h1>
        <p>Stall ID: {id}</p>
        <p>This is the stall details page for stall {id}.</p>
      </div>
    </>
  )
}

export default StallDetailsPage