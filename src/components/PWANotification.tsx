import React from 'react'
import { usePWA } from '../hooks/usePWA'

export function PWANotification() {
  const { offlineReady, needRefresh, updateServiceWorker, close } = usePWA()

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-indigo-600 text-neutral-50 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div className="flex justify-between items-start">
        <div>
          {offlineReady ? (
            <p>App is ready to work offline.</p>
          ) : (
            <div>
              <p>New content available!</p>
              <p className="text-sm mt-1">Refresh to update to the latest version.</p>
            </div>
          )}
        </div>
        <button 
          onClick={close}
          className="text-indigo-200 hover:text-neutral-50 ml-4"
          aria-label="Close notification"
        >
          &times;
        </button>
      </div>
      
      {needRefresh && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => updateServiceWorker(true)}
            className="bg-white text-indigo-600 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-50"
          >
            Refresh
          </button>
          <button
            onClick={close}
            className="bg-indigo-700 text-neutral-50 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-800"
          >
            Later
          </button>
        </div>
      )}
      
      {offlineReady && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={close}
            className="bg-white text-indigo-600 px-3 py-1 rounded text-sm font-medium hover:bg-indigo-50"
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}