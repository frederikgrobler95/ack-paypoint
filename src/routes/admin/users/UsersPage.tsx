import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsers } from '@/queries/users'
import { useAdminUpdateUserRoleMutation } from '@/mutations/useAdminUpdateUserRoleMutation'
import { useAdminResetUserTutorialMutation } from '@/mutations/useAdminResetUserTutorialMutation'
import { useAdminSignOutAllUsersMutation } from '@/mutations/useAdminSignOutAllUsersMutation'
import { SharedList } from '@/shared/ui'
import { User } from '@/shared/contracts/user'
import { useToast } from '@/contexts/ToastContext'
import ConfirmDialog from '@/shared/ui/ConfirmDialog'
import Button from '@/shared/ui/Button'
import { useTranslation } from 'react-i18next'

function UsersPage(): React.JSX.Element {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useUsers(searchTerm)
  
  const updateUserRoleMutation = useAdminUpdateUserRoleMutation()
  const resetUserTutorialMutation = useAdminResetUserTutorialMutation()
  const signOutAllUsersMutation = useAdminSignOutAllUsersMutation()
  
  // Get user data
  const flatUsers = React.useMemo(() => {
    return usersData?.data || []
  }, [usersData])
  
  // Handle pull to refresh
  const handleRefresh = async () => {
    await refetch()
  }
  
  // Handle sign out all users
  const handleSignOutAllUsers = async () => {
    try {
      const result = await signOutAllUsersMutation.mutateAsync()
      showToast(t('admin.users.signOutAllUsers.successMessage'), 'success')
      setShowConfirmDialog(false)
    } catch (error: any) {
      console.error('Error signing out all users:', error)
      showToast(error.message || t('admin.users.signOutAllUsers.errorMessage'), 'error')
      setShowConfirmDialog(false)
    }
  }
  
  // User Item Component
  const UserItem = ({ user }: { user: User }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    // Handle reset tutorial
    const handleResetTutorial = () => {
      if (window.confirm(`Are you sure you want to reset the tutorial for ${user.name}?`)) {
        resetUserTutorialMutation.mutate({ userId: user.id });
      }
      setIsMenuOpen(false);
    };
    
    // Handle update role
    const handleUpdateRole = () => {
      navigate(`/admin/users/role/${user.id}`);
      setIsMenuOpen(false);
    };
    
    return (
      <div className="p-2 hover:bg-gray-50 transition-colors duration-150">
        <div className="flex justify-between items-center">
          <div className="flex-1" onClick={() => navigate(`/admin/users/role/${user.id}`)}>
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-800 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                aria-label="User options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateRole();
                    }}
                    className="w-full justify-start px-3 py-1.5 text-left text-sm"
                  >
                    Update Role
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetTutorial();
                    }}
                    className="w-full justify-start px-3 py-1.5 text-left text-sm"
                  >
                    Reset Tutorial
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render user item
  const renderUserItem = (user: User, index: number) => {
    return <UserItem key={user.id} user={user} />;
  };
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('admin.users.title')}</h1>
          <p className="text-gray-500 text-sm">{t('admin.users.description')}</p>
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
                placeholder={t('admin.users.searchPlaceholder')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={signOutAllUsersMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-neutral-50 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 ease-in-out disabled:opacity-50"
            >
              {signOutAllUsersMutation.isPending ? (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('admin.users.signOutAllUsers.processing')}
                </>
              ) : (
                t('admin.users.signOutAllUsers')
              )}
            </button>
            <button
              onClick={() => navigate('/admin/users/add')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-neutral-50 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {t('admin.users.addUser')}
            </button>
          </div>
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
          emptyMessage={t('admin.users.noUsersFound')}
          errorMessage={`${t('admin.users.failedToLoadUsers')}: ${(error as Error)?.message || t('admin.users.unknownError')}`}
          loadingMessage={t('admin.users.loadingUsers')}
        />
      </div>
      
      {showConfirmDialog && (
        <ConfirmDialog
          title={t('admin.users.signOutAllUsers.confirmationTitle')}
          message={t('admin.users.signOutAllUsers.confirmationMessage')}
          onConfirm={handleSignOutAllUsers}
          onCancel={() => setShowConfirmDialog(false)}
          confirmText={t('admin.users.signOutAllUsers.confirmButton')}
          cancelText={t('admin.users.signOutAllUsers.cancelButton')}
          isDanger={true}
        />
      )}
    </div>
  )
}

export default UsersPage