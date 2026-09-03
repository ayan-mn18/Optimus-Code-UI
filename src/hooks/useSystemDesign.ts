import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AssessmentAnswer } from '@/lib/types';

export const systemDesignKey = (kind: 'LLD' | 'HLD') => ['system-design', kind] as const;

export function useSystemDesign(kind: 'LLD' | 'HLD') {
  return useQuery({
    queryKey: systemDesignKey(kind),
    queryFn: () => api.systemDesign({ kind }),
    staleTime: 5 * 60_000,
    refetchOnMount: 'always',
  });
}

export function useCreateAssessment() {
  return useMutation({ mutationFn: api.createAssessment });
}

export function useAssessment(attemptId: string | undefined) {
  return useQuery({
    queryKey: ['assessment', attemptId],
    queryFn: () => api.assessment(attemptId!),
    enabled: Boolean(attemptId),
    staleTime: 0,
  });
}

export function useSaveAssessmentAnswer(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: AssessmentAnswer }) =>
      api.saveAssessmentAnswer(attemptId, questionId, answer),
    onSuccess: ({ answer }) => {
      queryClient.setQueryData(['assessment', attemptId], (current: unknown) => {
        if (!current || typeof current !== 'object') return current;
        const response = current as { attempt: { answers: Record<string, AssessmentAnswer> } };
        return {
          ...response,
          attempt: {
            ...response.attempt,
            answers: { ...response.attempt.answers, [answer.question_id]: answer.answer },
          },
        };
      });
    },
  });
}

export function useSubmitAssessment(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.submitAssessment(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', attemptId] });
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['system-design'] });
    },
  });
}
