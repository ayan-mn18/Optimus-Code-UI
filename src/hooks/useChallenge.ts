import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { milestoneQueryKey } from '@/hooks/useMilestone';
import type { DailyGoals, Leaderboard, Problem, ProblemListResponse, Streak, TodayResponse } from '@/lib/types';

interface ToggleVars {
  problem: Problem;
  solved: boolean;
}

interface ToggleContext {
  previousToday?: TodayResponse;
  previousProblems?: ProblemListResponse;
}

export const queryKeys = {
  today: ['today'] as const,
  overview: ['overview'] as const,
  problems: ['problems'] as const,
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

export function useRecap(weeksAgo: number) {
  const { enrollment } = useAuth();
  return useQuery({
    queryKey: ['recap', weeksAgo],
    queryFn: () => api.recap(weeksAgo),
    enabled: Boolean(enrollment),
    staleTime: 60_000,
  });
}

export function useLeaderboard(metric: Leaderboard['metric']) {
  return useQuery({
    queryKey: ['leaderboard', metric],
    queryFn: () => api.leaderboard(metric),
    staleTime: 60_000,
  });
}


export function useProblems() {
  return useQuery({
    queryKey: queryKeys.problems,
    queryFn: api.problems,
    staleTime: 5 * 60_000,
  });
}

/**
 * Toggling a solve updates today's card optimistically — the checkbox should
 * feel instant — then reconciles against the server's day counters.
 */
export function useToggleSolve() {
  const queryClient = useQueryClient();

  return useMutation<{ streak: Streak }, Error, ToggleVars, ToggleContext>({
    mutationFn: async ({ problem, solved }) =>
      solved ? api.solve(problem.id) : api.unsolve(problem.id),

    onMutate: async ({ problem, solved }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.today }),
        queryClient.cancelQueries({ queryKey: queryKeys.problems }),
      ]);
      const previousToday = queryClient.getQueryData<TodayResponse>(queryKeys.today);
      const previousProblems = queryClient.getQueryData<ProblemListResponse>(queryKeys.problems);
      const patch = (item: Problem) => (item.id === problem.id ? { ...item, solved } : item);

      queryClient.setQueryData<TodayResponse>(queryKeys.today, (current) => {
        if (!current) return current;

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
      queryClient.setQueryData<ProblemListResponse>(queryKeys.problems, (current) =>
        current ? { ...current, items: current.items.map(patch) } : current,
      );

      return { previousToday, previousProblems };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousToday) queryClient.setQueryData(queryKeys.today, context.previousToday);
      if (context?.previousProblems) queryClient.setQueryData(queryKeys.problems, context.previousProblems);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.today });
      queryClient.invalidateQueries({ queryKey: queryKeys.overview });
      queryClient.invalidateQueries({ queryKey: queryKeys.problems });
      queryClient.invalidateQueries({ queryKey: milestoneQueryKey });
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
    mutationFn: (goals: DailyGoals) => api.enroll(goals),
    onSuccess: ({ enrollment }) => {
      setEnrollment(enrollment);
      queryClient.invalidateQueries();
    },
  });
}

export function useUpdateGoals() {
  const { setEnrollment } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goals: DailyGoals) => api.updateGoals(goals),
    onSuccess: ({ enrollment }) => {
      setEnrollment(enrollment);
      queryClient.invalidateQueries();
    },
  });
}
