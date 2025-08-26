import React from 'react'
import { useParams } from 'react-router-dom'


function CustomerDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div>
        <h1>Customer Details</h1>
        <p>Customer ID: {id}</p>
        <p>This is the customer details page for customer {id}.</p>
      </div>
    </>
  )
}

export default CustomerDetailsPage