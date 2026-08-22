import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';

export const milestoneQueryKey = ['milestone', 'pending'] as const;

export function usePendingMilestone() {
  const { user } = useAuth();

  return useQuery({
    queryKey: milestoneQueryKey,
    queryFn: async () => (await api.pendingMilestone()).milestone,
    enabled: Boolean(user),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useMarkMilestoneViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.markMilestoneViewed,
    onSuccess: () => queryClient.setQueryData(milestoneQueryKey, null),
  });
}
