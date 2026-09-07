import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ResearchBrief, ResearchJob } from '@/lib/types';

const SETTLED: ResearchJob['status'][] = ['published', 'needs_review', 'failed'];

export function useStartResearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (brief: ResearchBrief) => api.startResearch(brief),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['research'] }),
  });
}

export function useResearchStatus() {
  return useQuery({ queryKey: ['research', 'status'], queryFn: api.researchStatus, staleTime: 60_000 });
}

/**
 * Polls a running job. A pipeline run takes minutes, so the interval is slow
 * enough not to hammer the API and fast enough that the stage list feels live.
 */
export function useResearchJob(id: string | null) {
  return useQuery({
    queryKey: ['research', id],
    queryFn: () => api.researchJob(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.job.status;
      return status && SETTLED.includes(status) ? false : 4000;
    },
  });
}

export function useCancelResearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelResearch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['research'] }),
  });
}

/** Survives a reload so a refresh does not lose a run already in flight. */
export function useActiveJobId() {
  const [id, setId] = useState<string | null>(() => localStorage.getItem('oc.research-job'));

  useEffect(() => {
    if (id) localStorage.setItem('oc.research-job', id);
    else localStorage.removeItem('oc.research-job');
  }, [id]);

  return [id, setId] as const;
}
