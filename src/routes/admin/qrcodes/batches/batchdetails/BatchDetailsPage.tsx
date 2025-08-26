import React from 'react'
import { useParams } from 'react-router-dom'
import '../../../../App.css'

function BatchDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div>
        <h1>Batch Details</h1>
        <p>Batch ID: {id}</p>
        <p>This is the batch details page for batch {id}.</p>
      </div>
    </>
  )
}

export default BatchDetailsPage