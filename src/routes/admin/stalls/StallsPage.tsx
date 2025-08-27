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
  } = useStalls(20, searchTerm)
  
  // Log raw data from query
  React.useEffect(() => {
    if (stallsData) {
      console.log('Raw stalls data from query:', stallsData)
    }
  }, [stallsData])
  
  // Flatten paginated data
  const stalls = React.useMemo(() => {
    if (!stallsData?.pages) return []
    const flattenedStalls = stallsData.pages.flatMap(page => page.data)
    console.log('Fetched stall data:', flattenedStalls)
    return flattenedStalls
  }, [stallsData])
  
  // Render individual stall item
  const renderStallItem = (stall: Stall, index: number) => (
    <div
      className="p-4 cursor-pointer"
      onClick={() => navigate(`/admin/stalls/stalldetails/${stall.id}`)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-[#1A202C] text-base leading-6">{stall.name}</h3>
          <p className="text-[#4A5568] text-sm leading-5 capitalize">{stall.type}</p>
        </div>
      </div>
    </div>
  )
  
  return (
    <>
      <div className="p-4">
        <div className="flex gap-1 justify-between items-center mb-6">
          <div className="w-64">
            <input
              type="text"
              placeholder="Search stalls..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/admin/stalls/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1 px-2 rounded-md transition duration-300 ease-in-out"
          >
            Add New Stall
          </button>
        </div>
        
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
    </>
  )
}

export default StallsPage