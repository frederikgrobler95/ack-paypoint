import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '@/queries/users'
import { useAdminUpdateUserRoleMutation } from '@/mutations/useAdminUpdateUserRoleMutation'
import { useAdminResetUserTutorialMutation } from '@/mutations/useAdminResetUserTutorialMutation'
import { SharedList } from '@/shared/ui'
import { User } from '@/shared/contracts/user'

function UsersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useUsers(searchTerm)
  
  const updateUserRoleMutation = useAdminUpdateUserRoleMutation()
  const resetUserTutorialMutation = useAdminResetUserTutorialMutation()
  
  // Get user data
  const flatUsers = React.useMemo(() => {
    return usersData?.data || []
  }, [usersData])
  
  // Handle pull to refresh
  const handleRefresh = async () => {
    await refetch()
  }
  
  // Render user item
  const renderUserItem = (user: User, index: number) => (
    <div className="p-5 hover:bg-gray-50 transition-colors duration-150">
      <div
        className="cursor-pointer"
        onClick={() => navigate(`/admin/users/role/${user.id}`)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-800 font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate">{user.name}</h3>
              <p className="text-gray-500 text-sm truncate">@{user.username}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-current" fill="currentColor" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        </div>
        <div className="ml-14 mt-1">
          <p className="text-gray-500 text-sm truncate">{user.email}</p>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Users</h1>
          <p className="text-gray-500 text-sm">Manage user accounts and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="w-full sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/users/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add User
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList<User>
          data={flatUsers}
          renderItem={renderUserItem}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          isError={!!error}
          isEmpty={flatUsers.length === 0}
          emptyMessage="No users found"
          errorMessage={`Failed to load users: ${(error as Error)?.message || 'Unknown error'}`}
          loadingMessage="Loading users..."
        />
      </div>
    </div>
  )
}

export default UsersPage