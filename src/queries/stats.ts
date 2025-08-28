import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchDocument } from '../services/queryService';

// Define the Stats type based on the document structure
export interface Stats {
  totalCustomersRegistered: number;
  totalRevenue: number;
  totalSales: number;
}

// Query keys for stats-related queries
export const statsKeys = {
  all: ['stats'] as const,
  live: () => [...statsKeys.all, 'live'] as const,
};

// Fetch the live stats document
export const fetchLiveStats = async (): Promise<Stats | null> => {
  return fetchDocument<Stats>('stats', 'live');
};

// React Query hooks for stats

// Get the live stats
export const useLiveStats = () => {
  return useQuery({
    queryKey: statsKeys.live(),
    queryFn: fetchLiveStats,
  });
};

// Get the live stats (suspense version)
export const useSuspenseLiveStats = () => {
  return useSuspenseQuery({
    queryKey: statsKeys.live(),
    queryFn: fetchLiveStats,
  });
};