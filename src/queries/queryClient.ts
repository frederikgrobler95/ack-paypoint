import { QueryClient } from '@tanstack/react-query'

// Detect if running on mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: isMobile ? 1 : 3, // Fewer retries on mobile to save bandwidth
      refetchOnWindowFocus: false,
      // Mobile-specific optimizations
      gcTime: isMobile ? 1000 * 60 * 10 : 1000 * 60 * 15, // Shorter cache on mobile
      refetchOnReconnect: isMobile ? 'always' : true, // Always refetch on reconnect for mobile
    },
  },
})