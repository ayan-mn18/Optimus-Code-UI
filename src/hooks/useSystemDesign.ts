import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AssessmentAnswer, AssessmentAttempt, AssessmentResponse } from '@/lib/types';

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
  const queryClient = useQueryClient();
  const [streamConnected, setStreamConnected] = useState(false);
  const query = useQuery({
    queryKey: ['assessment', attemptId],
    queryFn: () => api.assessment(attemptId!),
    enabled: Boolean(attemptId),
    staleTime: 0,
    // Keep a short-poll fallback only until the authenticated progress stream
    // is connected. If the stream drops, polling resumes automatically.
    refetchInterval: (currentQuery) => {
      const attempt = (currentQuery.state.data as { attempt?: AssessmentAttempt } | undefined)?.attempt;
      const preparing = attempt && (attempt.status === 'generating'
        || (attempt.status === 'active' && !attempt.generationComplete));
      if (preparing && !streamConnected) return 1500;
      return attempt?.status === 'grading' ? 1500 : false;
    },
  });

  const attempt = query.data?.attempt;
  const preparing = Boolean(attempt && (attempt.status === 'generating'
    || (attempt.status === 'active' && !attempt.generationComplete)));

  useEffect(() => {
    if (!attemptId || !preparing || streamConnected) return undefined;
    const controller = new AbortController();
    let mounted = true;

    const consume = async () => {
      try {
        const response = await api.assessmentEvents(attemptId, controller.signal);
        if (!response.ok || !response.body) throw new Error(`Assessment stream failed (${response.status})`);
        if (mounted) setStreamConnected(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (mounted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf('\n\n');
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            const data = block.split('\n')
              .filter((line) => line.startsWith('data:'))
              .map((line) => line.slice(5).trim())
              .join('\n');
            if (data) {
              const snapshot = JSON.parse(data) as AssessmentResponse;
              queryClient.setQueryData(['assessment', attemptId], snapshot);
            }
            boundary = buffer.indexOf('\n\n');
          }
        }
      } catch (error) {
        if (mounted && (error as Error)?.name !== 'AbortError') setStreamConnected(false);
      }
    };
    void consume();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [attemptId, preparing, queryClient, streamConnected]);

  return query;
}

export function useAbandonAssessment(attemptId: string) {
  return useMutation({
    mutationFn: () => api.abandonAssessment(attemptId),
  });
}

export function useRunAssessmentAnswer(attemptId: string) {
  return useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: AssessmentAnswer }) =>
      api.runAssessmentAnswer(attemptId, questionId, answer),
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
