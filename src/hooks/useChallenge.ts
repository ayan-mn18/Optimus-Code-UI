import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import type { Problem, Streak, TodayResponse } from '@/lib/types';

interface ToggleVars {
  problem: Problem;
  solved: boolean;
}

export const queryKeys = {
  today: ['today'] as const,
  overview: ['overview'] as const,
  problems: (filters: Record<string, string>) => ['problems', filters] as const,
  topics: ['topics'] as const,
};

export function useToday() {
  const { enrollment } = useAuth();
  return useQuery({
    queryKey: queryKeys.today,
    queryFn: api.today,
    enabled: Boolean(enrollment),
    staleTime: 30_000,
  });
}

export function useOverview() {
  const { enrollment } = useAuth();
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: api.overview,
    enabled: Boolean(enrollment),
    staleTime: 30_000,
  });
}

export function useTopics() {
  return useQuery({ queryKey: queryKeys.topics, queryFn: api.topics, staleTime: 60 * 60_000 });
}

export function useProblems(filters: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.problems(filters),
    queryFn: () => api.problems(filters),
    staleTime: 30_000,
  });
}

/**
 * Toggling a solve updates today's card optimistically — the checkbox should
 * feel instant — then reconciles against the server's day counters.
 */
export function useToggleSolve() {
  const queryClient = useQueryClient();

  return useMutation<{ streak: Streak }, Error, ToggleVars, { previous?: TodayResponse }>({
    mutationFn: async ({ problem, solved }) =>
      solved ? api.solve(problem.id) : api.unsolve(problem.id),

    onMutate: async ({ problem, solved }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.today });
      const previous = queryClient.getQueryData<TodayResponse>(queryKeys.today);

      queryClient.setQueryData<TodayResponse>(queryKeys.today, (current) => {
        if (!current) return current;

        const patch = (item: Problem) => (item.id === problem.id ? { ...item, solved } : item);

        // Only the target set moves the day's counter; extra sets are bonus,
        // but their checkboxes still need to feel instant.
        const problems = current.problems.map(patch);
        const extraSets = current.extraSets.map((set) => ({ ...set, problems: set.problems.map(patch) }));
        const solvedCount = problems.filter((item) => item.solved).length;

        return {
          ...current,
          problems,
          extraSets,
          bonusProblems: current.bonusProblems.map(patch),
          solvedCount,
          isComplete: solvedCount >= current.target,
          status: solvedCount >= current.target ? 'complete' : current.status,
        };
      });

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.today, context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.today });
      queryClient.invalidateQueries({ queryKey: queryKeys.overview });
      queryClient.invalidateQueries({ queryKey: ['problems'] });
    },
  });
}

/** Deals another set for today once the target is met. */
export function useExtendToday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.extendToday,
    onSuccess: (today) => {
      queryClient.setQueryData(queryKeys.today, today);
      queryClient.invalidateQueries({ queryKey: queryKeys.overview });
    },
  });
}

export function useEnroll() {
  const { setEnrollment } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dailyTarget: number) => api.enroll(dailyTarget),
    onSuccess: ({ enrollment }) => {
      setEnrollment(enrollment);
      queryClient.invalidateQueries();
    },
  });
}
