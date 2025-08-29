import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStalls } from '@/queries/stalls'
import { SharedList } from '@/shared/ui'
import { Stall } from '@/shared/contracts/stall'

function StallsPage(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  
  // Fetch stalls data
  const {
    data: stallsData,
    isLoading,
    isError,
    error,
    refetch
  } = useStalls(searchTerm)
  
  // Get stall data
  const stalls = React.useMemo(() => {
    return stallsData?.data || []
  }, [stallsData])
  
  // Render individual stall item
  const renderStallItem = (stall: Stall, index: number) => (
    <div
      className="p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
      onClick={() => navigate(`/admin/stalls/stalldetails/${stall.id}`)}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="ml-4 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">{stall.name}</h3>
          <p className="text-gray-500 text-sm capitalize">{stall.type}</p>
        </div>
        <div className="ml-auto">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Stalls</h1>
          <p className="text-gray-500 text-sm">Manage marketplace stalls</p>
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
                placeholder="Search stalls..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/stalls/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-neutral-50 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Stall
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <SharedList
          data={stalls}
          renderItem={renderStallItem}
          onRefresh={refetch}
          isLoading={isLoading}
          isError={isError}
          isEmpty={stalls.length === 0}
          emptyMessage="No stalls found"
          errorMessage={error?.message || "Failed to load stalls"}
          loadingMessage="Loading stalls..."
        />
      </div>
    </div>
  )
}

export default StallsPage