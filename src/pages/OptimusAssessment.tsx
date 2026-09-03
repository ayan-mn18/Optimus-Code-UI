import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, LockKeyhole, Sparkles } from 'lucide-react';
import { Button, Card, Spinner } from '@/components/ui/primitives';
import { useAssessment, useSaveAssessmentAnswer, useSubmitAssessment } from '@/hooks/useSystemDesign';
import { cn } from '@/lib/utils';
import type { AssessmentAnswer } from '@/lib/types';

const answerValues = (answer: AssessmentAnswer | undefined) => answer?.values ?? [];
const sameAnswers = (left: string[], right: string[]) => {
  const a = [...new Set(left)].sort();
  const b = [...new Set(right)].sort();
  return a.length === b.length && a.every((value, index) => value === b[index]);
};

export function OptimusAssessment() {
  const { attemptId } = useParams();
  const query = useAssessment(attemptId);
  const save = useSaveAssessmentAnswer(attemptId ?? '');
  const submit = useSubmitAssessment(attemptId ?? '');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (query.data?.attempt.answers) setAnswers(query.data.attempt.answers);
  }, [query.data?.attempt.answers]);

  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const holdRoute = () => window.history.pushState(null, '', window.location.href);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('beforeunload', warn);
    window.addEventListener('popstate', holdRoute);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('beforeunload', warn);
      window.removeEventListener('popstate', holdRoute);
    };
  }, []);

  const response = query.data;
  const attempt = response?.attempt;
  const problem = response?.problem;
  const question = attempt?.questions[current];
  const answeredCount = useMemo(
    () => attempt?.questions.filter((item) => answerValues(answers[item.id]).length > 0).length ?? 0,
    [answers, attempt?.questions],
  );
  const liveScore = useMemo(
    () => attempt?.questions.filter((item) => sameAnswers(answerValues(answers[item.id]), item.correctAnswers)).length ?? 0,
    [answers, attempt?.questions],
  );

  if (!attemptId) return <Navigate to="/system-design/lld" replace />;
  if (query.isLoading) return <div className="grid min-h-dvh place-items-center"><Spinner className="size-7" /></div>;
  if (query.isError || !attempt || !problem || !question) {
    return <div className="grid min-h-dvh place-items-center px-5"><Card className="max-w-md border-bad/30"><p className="text-sm text-bad">{query.error?.message ?? 'Assessment could not load.'}</p></Card></div>;
  }
  if (attempt.status === 'passed' || attempt.status === 'failed') {
    return <AssessmentResult passed={attempt.status === 'passed'} score={attempt.score ?? 0} kind={problem.kind === 'HLD' ? 'HLD' : 'LLD'} />;
  }

  const toggleOption = (option: string) => {
    const selected = answerValues(answers[question.id]);
    const values = question.selectionMode === 'single'
      ? [option]
      : selected.includes(option) ? selected.filter((value) => value !== option) : [...selected, option];
    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: { values } }));
  };

  const persistCurrent = async () => {
    const answer = answers[question.id];
    if (!answer || !answerValues(answer).length) return;
    await save.mutateAsync({ questionId: question.id, answer });
  };

  const move = async (next: number) => {
    await persistCurrent();
    setCurrent(next);
  };

  const submitAll = async () => {
    await persistCurrent();
    const response = await submit.mutateAsync();
    if (response.passed) await query.refetch();
    else await query.refetch();
  };

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-line bg-canvas/95 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand-strong to-accent text-sm font-bold text-white">O</span>
          <div><p className="text-sm font-semibold">Optimus</p><p className="text-[10px] uppercase tracking-wider text-ink-dim">Focused assessment</p></div>
        </div>
        <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[10px] text-ink-muted sm:inline-flex">
          <LockKeyhole className="size-3 text-good" /> Navigation locked during assessment
        </span>
        <span className="font-mono text-xs text-ink-muted">{minutes}:{seconds}</span>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-surface p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="truncate text-sm font-semibold">{query.data?.problem.title}</p>
          <p className="mt-1 text-[11px] text-ink-dim">{answeredCount}/10 answered · live score {liveScore}/10</p>
          <div className="mt-4 grid grid-cols-10 gap-1.5 lg:grid-cols-5">
            {attempt.questions.map((item, index) => {
              const answered = answerValues(answers[item.id]).length > 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Question ${index + 1}`}
                  onClick={() => move(index)}
                  className={cn(
                    'grid aspect-square min-w-7 place-items-center rounded-lg border text-xs transition-colors',
                    index === current
                      ? 'border-brand bg-brand-strong text-white'
                      : answered
                        ? 'border-good/30 bg-good/10 text-good'
                        : 'border-line bg-card text-ink-dim',
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-5 hidden rounded-xl border border-warn/20 bg-warn/[0.05] p-3 text-[10px] leading-relaxed text-ink-dim lg:block">
            Browser tabs cannot be blocked. Optimus removes in-app navigation and protects this attempt server-side.
          </div>
        </aside>

        <main className="min-w-0 overflow-y-auto px-4 py-7 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[10px] uppercase tracking-[0.14em] text-brand-pale">Question {current + 1} of 10 · {question.label}</p>
            <h1 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{question.prompt}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted">{question.context}</p>

            <div className="mt-7">
              <div className="grid gap-2">
                <p className="mb-1 text-xs text-ink-dim">{question.selectionMode === 'multiple' ? 'Select all that apply.' : 'Select one answer.'}</p>
                  {question.options.map((option) => {
                    const selected = answerValues(answers[question.id]).includes(option);
                    return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleOption(option)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm',
                        selected ? 'border-brand/60 bg-brand/10' : 'border-line bg-surface hover:border-line-strong',
                      )}
                    >
                      {selected ? <CheckCircle2 className="size-4 text-brand" /> : <Circle className="size-4 text-ink-dim" />}
                      {option}
                    </button>
                    );
                  })}
              </div>
            </div>

            {(save.isError || submit.isError) && (
              <p role="alert" className="mt-4 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
                {(save.error ?? submit.error)?.message}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" disabled={current === 0 || save.isPending} onClick={() => move(current - 1)} icon={<ChevronLeft className="size-4" />}>Previous</Button>
              {current === 9 ? (
                <Button loading={submit.isPending || save.isPending} disabled={answeredCount < 10} onClick={submitAll} icon={<Sparkles className="size-4" />}>Submit assessment</Button>
              ) : (
                <Button loading={save.isPending} onClick={() => move(current + 1)}>Save and continue <ChevronRight className="size-4" /></Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function AssessmentResult({ passed, score, kind }: { passed: boolean; score: number; kind: 'LLD' | 'HLD' }) {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <Card className="w-full max-w-lg text-center">
        <span className={cn('mx-auto grid size-24 place-items-center rounded-full border-4 text-2xl font-semibold', passed ? 'border-good/30 bg-good/10 text-good' : 'border-warn/30 bg-warn/10 text-warn')}>{score}/10</span>
        <h1 className="mt-5 text-2xl font-semibold">{passed ? 'Optimus approved this solution.' : 'Review, then try again.'}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">{passed ? 'This System Design problem now counts toward your daily goal.' : 'You need more than 80% correct answers to pass.'}</p>
        <a href={`/system-design/${kind.toLowerCase()}`} className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-strong to-brand px-5 text-sm font-medium text-white">Return to System Design</a>
      </Card>
    </div>
  );
}
