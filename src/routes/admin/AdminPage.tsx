import React from 'react'
import { Outlet } from 'react-router-dom'
import '../../App.css'

function AdminPage(): React.JSX.Element {
  return (
    <>
      <div>
        <h1>Admin Page</h1>
        <p>This is the admin page for users with admin assignment.</p>
      </div>
      <Outlet />
    </>
  )
}

export default AdminPage