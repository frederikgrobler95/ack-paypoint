import React from 'react'
import { useParams } from 'react-router-dom'
import '../../../../App.css'

function OperatorsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div>
        <h1>Stall Operators</h1>
        <p>Stall ID: {id}</p>
        <p>This is the operators page for stall {id}.</p>
      </div>
    </>
  )
}

export default OperatorsPage