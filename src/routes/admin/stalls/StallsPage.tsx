import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStalls } from '@/queries/stalls'
import { SharedList } from '@/shared/ui'
import { Stall } from '@/shared/contracts/stall'

function StallsPage(): React.JSX.Element {
  const navigate = useNavigate()
  
  // Fetch stalls data
  const {
    data: stallsData,
    isLoading,
    isError,
    error,
    refetch
  } = useStalls(20)
  
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
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            onClick={() => navigate('/admin/stalls/add')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
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