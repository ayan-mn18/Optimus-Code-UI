import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Bug, CheckCircle2, ChevronLeft, ChevronRight, Circle, Code2, Cpu, Database, FileCode2,
  Gauge, ListChecks, LockKeyhole, Play, ShieldCheck, Sparkles, Terminal, WifiOff, XCircle,
} from 'lucide-react';
import { Button, Card, Spinner } from '@/components/ui/primitives';
import {
  useAbandonAssessment, useAssessment, useRunAssessmentAnswer, useSaveAssessmentAnswer, useSubmitAssessment,
} from '@/hooks/useSystemDesign';
import { cn } from '@/lib/utils';
import { isChoiceAnswer } from '@/lib/types';
import type {
  AssessmentAnswer, AssessmentAttempt, AssessmentQuestion, AssessmentReviewItem,
  CodingQuestion, McqQuestion, RunResponse, RunResult, SqlQuestion, VisibleTest,
} from '@/lib/types';

const choiceValues = (answer: AssessmentAnswer | undefined) => (isChoiceAnswer(answer) ? answer.values : []);
const sourceOf = (answer: AssessmentAnswer | undefined) => (answer && !isChoiceAnswer(answer) ? answer.source : '');

const isAnswered = (question: AssessmentQuestion, answer: AssessmentAnswer | undefined) =>
  (question.type === 'mcq' ? choiceValues(answer).length > 0 : sourceOf(answer).trim().length > 0);

const QUESTION_ICON = {
  mcq: ListChecks,
  machine_coding: Code2,
  debug: Bug,
  sql: Database,
} as const;

const QUESTION_LABEL = {
  mcq: 'Multiple choice',
  machine_coding: 'Machine coding',
  debug: 'Debug and fix',
  sql: 'SQL',
} as const;

export function OptimusAssessment() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const query = useAssessment(attemptId);
  const abandon = useAbandonAssessment(attemptId ?? '');
  const save = useSaveAssessmentAnswer(attemptId ?? '');
  const run = useRunAssessmentAnswer(attemptId ?? '');
  const submit = useSubmitAssessment(attemptId ?? '');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [runs, setRuns] = useState<Record<string, RunResponse>>({});
  const [elapsed, setElapsed] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);

  useEffect(() => {
    if (query.data?.attempt.answers) setAnswers((current) => ({ ...query.data.attempt.answers, ...current }));
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
    () => attempt?.questions.filter((item) => isAnswered(item, answers[item.id])).length ?? 0,
    [answers, attempt?.questions],
  );

  if (!attemptId) return <Navigate to="/system-design/lld" replace />;
  if (query.isLoading) return <div className="grid min-h-dvh place-items-center"><Spinner className="size-7" /></div>;
  const leaveAssessment = () => navigate(problem?.kind === 'HLD' ? '/system-design/hld' : '/system-design/lld', { replace: true });
  const quitAssessment = async () => {
    await abandon.mutateAsync();
    leaveAssessment();
  };

  if (query.isError || !attempt || !problem) {
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <Card className="max-w-md border-bad/30">
          <p className="text-sm text-bad">{query.error?.message ?? 'Assessment could not load.'}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-dim">The paper may still be preparing, or this assessment link may have expired.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" loading={query.isFetching} onClick={() => query.refetch()}>Retry</Button>
            <Button size="sm" variant="ghost" onClick={leaveAssessment}>Back to assessments</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (attempt.status === 'generating' && attempt.questions.length === 0) {
    return (
      <PreparingAssessment
        problem={problem}
        elapsed={elapsed}
        onQuit={() => setConfirmQuit(true)}
        confirmQuit={confirmQuit}
        quitLoading={abandon.isPending}
        quitError={abandon.error?.message}
        onKeepWorking={() => setConfirmQuit(false)}
        onConfirmQuit={quitAssessment}
      />
    );
  }
  if (attempt.status === 'grading') return <Waiting title="Optimus is grading" body="Your code is running against the hidden tests. This page updates itself." />;
  if (attempt.status === 'passed' || attempt.status === 'failed') return <AssessmentResult attempt={attempt} kind={problem.kind === 'HLD' ? 'HLD' : 'LLD'} />;
  if (!question) return <Waiting title="Optimus is preparing" body="One moment." />;

  const setAnswer = (answer: AssessmentAnswer) => setAnswers((current) => ({ ...current, [question.id]: answer }));

  const persistCurrent = async () => {
    const answer = answers[question.id];
    if (!answer || !isAnswered(question, answer)) return;
    await save.mutateAsync({ questionId: question.id, answer });
  };

  const move = async (next: number) => {
    await persistCurrent();
    setCurrent(next);
  };

  const runCurrent = async (answer: AssessmentAnswer) => {
    const result = await run.mutateAsync({ questionId: question.id, answer });
    setRuns((current) => ({ ...current, [question.id]: result }));
  };

  const submitAll = async () => {
    await persistCurrent();
    await submit.mutateAsync();
    await query.refetch();
  };

  const saveUntilNextQuestion = async () => {
    await persistCurrent();
    await query.refetch();
  };

  const total = attempt.generationComplete ? attempt.questions.length : attempt.totalQuestions;
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-line bg-canvas/95 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand-strong to-accent text-sm font-bold text-white">O</span>
          <div>
            <p className="text-sm font-semibold">Optimus</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-dim">Focused assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[10px] text-ink-muted sm:inline-flex">
            <LockKeyhole className="size-3 text-good" /> Navigation locked during assessment
          </span>
          <span className="font-mono text-xs text-ink-muted">{minutes}:{seconds}</span>
          <Button size="sm" variant="danger" onClick={() => setConfirmQuit(true)} icon={<XCircle className="size-3.5" />}>Quit</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside className="border-b border-line bg-surface p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="truncate text-sm font-semibold">{problem.title}</p>
          <p className="mt-1 text-[11px] text-ink-dim">
            {answeredCount}/{total} answered · pass mark {Math.round(attempt.passRatio * 100)}%
          </p>

          <ul className="mt-4 space-y-1.5">
            {attempt.questions.map((item, index) => {
              const Icon = QUESTION_ICON[item.type];
              const done = isAnswered(item, answers[item.id]);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => move(index)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors',
                      index === current
                        ? 'border-brand bg-brand/10 text-ink'
                        : done
                          ? 'border-good/25 bg-good/[0.06] text-ink-muted'
                          : 'border-line bg-card text-ink-dim hover:border-line-strong',
                    )}
                  >
                    <Icon className={cn('size-3.5 shrink-0', done && index !== current && 'text-good')} />
                    <span className="min-w-0 flex-1 truncate">{QUESTION_LABEL[item.type]}</span>
                    <span className="shrink-0 font-mono text-[10px] text-ink-dim">{item.weight}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 hidden rounded-xl border border-warn/20 bg-warn/[0.05] p-3 text-[10px] leading-relaxed text-ink-dim lg:block">
            Sample tests run on demand. Hidden tests run once, when you submit.
          </div>
        </aside>

        <main className="min-w-0 overflow-y-auto px-4 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-6xl">
            {!attempt.generationComplete && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/10 px-3 py-2 text-xs text-brand-pale">
                <Spinner className="size-3.5" />
                <span>Question {attempt.questionsReady} is ready. Optimus is preparing the next one in the background.</span>
              </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.14em] text-brand-pale">
              Question {current + 1} of {total} · {QUESTION_LABEL[question.type]} · worth {question.weight}
            </p>

            {question.type === 'mcq' && (
              <ChoicePane question={question} values={choiceValues(answers[question.id])} onChange={(values) => setAnswer({ values })} />
            )}
            {(question.type === 'machine_coding' || question.type === 'debug') && (
              <CodePane
                question={question}
                answer={answers[question.id]}
                defaultLanguage={attempt.language ?? 'python'}
                onChange={setAnswer}
                onRun={runCurrent}
                running={run.isPending}
                result={runs[question.id]}
              />
            )}
            {question.type === 'sql' && (
              <SqlPane
                question={question}
                source={sourceOf(answers[question.id])}
                onChange={(source) => setAnswer({ language: 'sql', source })}
                onRun={runCurrent}
                running={run.isPending}
                result={runs[question.id]}
              />
            )}

            {(save.isError || submit.isError || run.isError) && (
              <p role="alert" className="mt-4 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
                {(save.error ?? submit.error ?? run.error)?.message}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button variant="outline" disabled={current === 0 || save.isPending} onClick={() => move(current - 1)} icon={<ChevronLeft className="size-4" />}>Previous</Button>
              {current === attempt.questions.length - 1 && !attempt.generationComplete ? (
                <Button variant="outline" loading={save.isPending || query.isFetching} disabled={!isAnswered(question, answers[question.id])} onClick={saveUntilNextQuestion} icon={<Spinner className="size-3.5" />}>Preparing next question…</Button>
              ) : current === total - 1 ? (
                <Button loading={submit.isPending || save.isPending} disabled={!attempt.generationComplete || answeredCount < total} onClick={submitAll} icon={<Sparkles className="size-4" />}>Submit assessment</Button>
              ) : (
                <Button loading={save.isPending} onClick={() => move(current + 1)}>Save and continue <ChevronRight className="size-4" /></Button>
              )}
            </div>
          </div>
        </main>
      </div>
      {confirmQuit && <QuitDialog loading={abandon.isPending} error={abandon.error?.message} onKeepWorking={() => setConfirmQuit(false)} onQuit={quitAssessment} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Waiting({ title, body, onQuit }: { title: string; body: string; onQuit?: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <Card className="max-w-md text-center">
        <Spinner className="mx-auto size-7" />
        <h1 className="mt-5 text-lg font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{body}</p>
        {onQuit && <Button className="mt-5" size="sm" variant="danger" onClick={onQuit} icon={<XCircle className="size-3.5" />}>Quit assessment</Button>}
      </Card>
    </div>
  );
}

function PreparingAssessment({
  problem,
  elapsed,
  onQuit,
  confirmQuit,
  quitLoading,
  quitError,
  onKeepWorking,
  onConfirmQuit,
}: {
  problem: { title: string };
  elapsed: number;
  onQuit: () => void;
  confirmQuit: boolean;
  quitLoading: boolean;
  quitError?: string;
  onKeepWorking: () => void;
  onConfirmQuit: () => void;
}) {
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b border-line bg-canvas/95 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-brand-strong to-accent text-sm font-bold text-white">O</span>
          <div>
            <p className="text-sm font-semibold">Optimus</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-dim">Focused assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[10px] text-ink-muted sm:inline-flex">
            <LockKeyhole className="size-3 text-good" /> Navigation locked during assessment
          </span>
          <span className="font-mono text-xs text-ink-muted">{minutes}:{seconds}</span>
          <Button size="sm" variant="danger" onClick={onQuit} icon={<XCircle className="size-3.5" />}>Quit</Button>
        </div>
      </header>
      <main className="grid min-h-0 flex-1 place-items-center px-5 py-10">
        <Card className="w-full max-w-xl text-center">
          <Spinner className="mx-auto size-8" />
          <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-brand-pale">{problem.title}</p>
          <h1 className="mt-2 text-xl font-semibold">Preparing question 1</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            Optimus is generating and verifying the first question. It will appear here as soon as it is ready; the remaining questions will continue loading in the background.
          </p>
        </Card>
      </main>
      {confirmQuit && <QuitDialog loading={quitLoading} error={quitError} onKeepWorking={onKeepWorking} onQuit={onConfirmQuit} />}
    </div>
  );
}

function QuitDialog({ loading, error, onKeepWorking, onQuit }: {
  loading: boolean;
  error?: string;
  onKeepWorking: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-canvas/80 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="quit-assessment-title">
      <Card className="w-full max-w-md border-bad/30 shadow-2xl">
        <h2 id="quit-assessment-title" className="text-lg font-semibold">Quit this assessment?</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">Your current answers will be discarded and this open attempt will be closed. You can start a new assessment later.</p>
        {error && <p role="alert" className="mt-3 text-xs text-bad">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled={loading} onClick={onKeepWorking}>Keep working</Button>
          <Button size="sm" variant="danger" loading={loading} onClick={onQuit}>Quit assessment</Button>
        </div>
      </Card>
    </div>
  );
}

function ChoicePane({ question, values, onChange }: {
  question: McqQuestion;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (option: string) => {
    if (question.selectionMode === 'single') return onChange([option]);
    return onChange(values.includes(option) ? values.filter((value) => value !== option) : [...values, option]);
  };

  return (
    <>
      <h1 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{question.prompt}</h1>
      {question.context && <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">{question.context}</p>}
      <div className="mt-7 grid gap-2">
        <p className="mb-1 text-xs text-ink-dim">{question.selectionMode === 'multiple' ? 'Select all that apply.' : 'Select one answer.'}</p>
        {question.options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm',
                selected ? 'border-brand/60 bg-brand/10' : 'border-line bg-surface hover:border-line-strong',
              )}
            >
              {selected ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" /> : <Circle className="mt-0.5 size-4 shrink-0 text-ink-dim" />}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function CodePane({ question, answer, defaultLanguage, onChange, onRun, running, result }: {
  question: CodingQuestion;
  answer: AssessmentAnswer | undefined;
  defaultLanguage: string;
  onChange: (answer: AssessmentAnswer) => void;
  onRun: (answer: AssessmentAnswer) => void;
  running: boolean;
  result?: RunResponse;
}) {
  const allowed = question.languages.map((choice) => choice.id);
  const saved = answer && !isChoiceAnswer(answer) ? answer : undefined;
  const language = saved?.language && allowed.includes(saved.language as never)
    ? saved.language
    : (allowed.includes(defaultLanguage as never) ? defaultLanguage : allowed[0]);
  const source = saved?.source ?? question.starters[language] ?? '';
  const languageChoice = question.languages.find((choice) => choice.id === language);
  const monaco = languageChoice?.monaco ?? 'python';

  // Switching language starts from that language's skeleton, unless the
  // student has already written something in it.
  const switchLanguage = (next: string) => onChange({ language: next, source: question.starters[next] ?? '' });

  return (
    <>
      <h1 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{question.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-dim">
        <span>{question.type === 'debug' ? 'Repair the failing implementation.' : 'Implement the contract, then prove it with tests.'}</span>
        {question.minutes && <span className="rounded-full border border-line bg-surface px-2 py-0.5">~{question.minutes} min</span>}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-4">
          <Card className="prose-optimus max-h-[32rem] overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">{question.statement}</p>
          </Card>

          <Card>
            <p className="text-[10px] uppercase tracking-wider text-ink-dim">Contract</p>
            <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-ink-muted">
{`${question.entity.name}(${question.entity.constructorParams.map((param) => `${param.name}: ${param.type}`).join(', ')})`}
{question.entity.methods.map((method) => `\n  ${method.name}(${method.params.map((param) => `${param.name}: ${param.type}`).join(', ')}) -> ${method.returns}`).join('')}
            </pre>
          </Card>

          <SampleTests tests={question.visibleTests} results={result?.results} />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_18px_50px_-30px] shadow-brand-strong/70">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-linear-to-r from-brand-strong/15 via-surface to-accent/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg border border-brand/30 bg-brand/10 text-brand-pale">
                  <Terminal className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold">Optimus code runner</p>
                  <p className="mt-0.5 text-[10px] text-ink-dim">Secure isolated sandbox</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-ink-dim">
                <span className="inline-flex items-center gap-1 rounded-full border border-good/25 bg-good/[0.07] px-2 py-1 text-good">
                  <ShieldCheck className="size-3" /> Network off
                </span>
                <span className="hidden rounded-full border border-line px-2 py-1 sm:inline-flex">{result?.runsLeft ?? 20} runs left</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-card px-3 py-2">
              <div className="flex gap-1.5">
              {question.languages.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => switchLanguage(choice.id)}
                  className={cn(
                    'rounded-lg border px-2.5 py-1 text-xs',
                    choice.id === language ? 'border-brand/60 bg-brand/10 text-ink' : 'border-line bg-card text-ink-dim hover:border-line-strong',
                  )}
                >
                  {choice.label}
                </button>
              ))}
              {question.type === 'debug' && (
                  <span className="self-center pl-1 text-[10px] text-ink-dim">Fix the code as given.</span>
              )}
              </div>
              <Button size="sm" variant="primary" loading={running} onClick={() => onRun({ language, source })} icon={<Play className="size-3.5" />}>Run sample tests</Button>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-line bg-[#0b0b10] px-3 py-2 text-[10px] text-ink-dim">
              <span className="inline-flex items-center gap-1.5 font-mono text-ink-muted"><FileCode2 className="size-3.5 text-brand-pale" /> solution.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}</span>
              <span className="hidden sm:inline">Autosaved when you continue</span>
            </div>

            <Editor
              height="30rem"
              theme="vs-dark"
              language={monaco}
              value={source}
              onChange={(value) => onChange({ language, source: value ?? '' })}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                tabSize: language === 'python' ? 4 : 2,
                automaticLayout: true,
                padding: { top: 14, bottom: 14 },
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#0b0b10] px-3 py-2 text-[10px] text-ink-dim">
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-good" /> Ready to run</span>
              <span className="font-mono">{source.length.toLocaleString()} chars · {languageChoice?.label ?? language}</span>
            </div>
          </div>

          <RunSummary result={result} />
        </div>
      </div>
    </>
  );
}

function SqlPane({ question, source, onChange, onRun, running, result }: {
  question: SqlQuestion;
  source: string;
  onChange: (source: string) => void;
  onRun: (answer: AssessmentAnswer) => void;
  running: boolean;
  result?: RunResponse;
}) {
  const effective = source || question.starter;
  return (
    <>
      <h1 className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">{question.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-dim">
        <span className="rounded-full border border-accent/25 bg-accent/[0.07] px-2 py-0.5 text-accent">SQLite</span>
        <span>{question.orderMatters ? 'Row order matters.' : 'Row order is normalised.'}</span>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 space-y-4">
          <Card>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">{question.statement}</p>
          </Card>
          <Card>
            <p className="text-[10px] uppercase tracking-wider text-ink-dim">Schema</p>
            <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-ink-muted">{question.schema}</pre>
          </Card>
          <Card>
            <p className="text-[10px] uppercase tracking-wider text-ink-dim">Sample data</p>
            <pre className="mt-2 max-h-52 overflow-auto font-mono text-xs leading-relaxed text-ink-dim">{question.sampleSeed}</pre>
          </Card>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_18px_50px_-30px] shadow-accent/60">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-linear-to-r from-accent/10 via-surface to-brand-strong/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Database className="size-4" /></span>
                <div>
                  <p className="text-xs font-semibold">SQLite query runner</p>
                  <p className="mt-0.5 text-[10px] text-ink-dim">Isolated sample database</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-good/25 bg-good/[0.07] px-2 py-1 text-[10px] text-good"><WifiOff className="size-3" /> Offline execution</span>
            </div>
            <div className="flex items-center justify-between gap-2 border-b border-line bg-card px-3 py-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-ink-muted"><FileCode2 className="size-3.5 text-accent" /> query.sql</span>
              <Button size="sm" variant="primary" loading={running} onClick={() => onRun({ language: 'sql', source: effective })} icon={<Play className="size-3.5" />}>Run on sample</Button>
            </div>
            <Editor
              height="24rem"
              theme="vs-dark"
              language="sql"
              value={effective}
              onChange={(value) => onChange(value ?? '')}
              options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 14, bottom: 14 }, renderLineHighlight: 'gutter' }}
            />
            <div className="flex items-center justify-between gap-2 border-t border-line bg-[#0b0b10] px-3 py-2 text-[10px] text-ink-dim">
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-good" /> Ready to run</span>
              <span className="font-mono">{effective.length.toLocaleString()} chars · SQL</span>
            </div>
          </div>
          <RunSummary result={result} />
        </div>
      </div>
    </>
  );
}

function SampleTests({ tests, results }: { tests: VisibleTest[]; results?: RunResult[] }) {
  const byName = new Map((results ?? []).map((result) => [result.name, result]));
  const passed = tests.filter((test) => byName.get(test.name)?.passed).length;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-dim">Public contract tests</p>
          <p className="mt-1 text-xs text-ink-muted">Use these examples to validate the shape of your solution.</p>
        </div>
        <span className={cn('shrink-0 rounded-full border px-2 py-1 font-mono text-[10px]', results ? 'border-good/25 bg-good/[0.07] text-good' : 'border-line text-ink-dim')}>
          {results ? `${passed}/${tests.length}` : `${tests.length} tests`}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {tests.map((test) => {
          const outcome = byName.get(test.name);
          return (
            <li key={test.name} className="rounded-lg border border-line bg-card p-2.5">
              <div className="flex items-center gap-2 text-xs">
                {outcome
                  ? outcome.passed
                    ? <CheckCircle2 className="size-3.5 shrink-0 text-good" />
                    : <XCircle className="size-3.5 shrink-0 text-bad" />
                  : <Circle className="size-3.5 shrink-0 text-ink-dim" />}
                <span className="truncate">{test.name}</span>
              </div>
              <pre className="mt-1.5 overflow-x-auto font-mono text-[11px] leading-relaxed text-ink-dim">
                {test.steps.map((step) => (step.op === 'new'
                  ? `new(${step.args.map((arg) => JSON.stringify(arg)).join(', ')})`
                  : `${step.op}(${step.args.map((arg) => JSON.stringify(arg)).join(', ')})${step.expect === undefined ? '' : ` → ${step.expect}`}`)).join('\n')}
              </pre>
              {outcome && !outcome.passed && (
                <p className="mt-1.5 font-mono text-[11px] text-bad">
                  {outcome.error ?? `${outcome.step}: expected ${outcome.expected}, got ${outcome.actual}`}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function RunSummary({ result }: { result?: RunResponse }) {
  if (!result) return null;
  const problem = result.compileOutput || result.stderr;
  return (
    <div className={cn('rounded-xl border p-3 text-xs', result.passed ? 'border-good/30 bg-good/[0.07]' : 'border-warn/30 bg-warn/[0.06]')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={cn('inline-flex items-center gap-1.5 font-medium', result.passed ? 'text-good' : 'text-warn')}>
          {result.passed ? <CheckCircle2 className="size-3.5" /> : <Gauge className="size-3.5" />}
          {result.passedCount}/{result.total} public tests passed
        </p>
        <div className="flex items-center gap-3 text-[10px] text-ink-dim">
          {result.status?.description && <span className="rounded-full border border-line px-2 py-1">{result.status.description}</span>}
          {result.time && <span className="inline-flex items-center gap-1"><Cpu className="size-3" /> {result.time}s</span>}
          {result.memory && <span className="inline-flex items-center gap-1"><Gauge className="size-3" /> {Math.round(result.memory / 1024)} MB</span>}
          <span>{result.runsLeft} runs left</span>
        </div>
      </div>
      {problem && <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-ink-dim">{problem}</pre>}
      {result.passed && <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-ink-dim"><ShieldCheck className="size-3 text-good" /> Public tests passed. Hidden tests run only when you submit.</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AssessmentResult({ attempt, kind }: { attempt: AssessmentAttempt; kind: 'LLD' | 'HLD' }) {
  const passed = attempt.status === 'passed';
  const score = attempt.score ?? 0;
  const maxScore = attempt.maxScore ?? attempt.questions.length;
  const percent = maxScore ? Math.round((score / maxScore) * 100) : 0;
  const byId = new Map((attempt.review ?? []).map((item) => [item.id, item]));

  return (
    <div className="min-h-dvh bg-canvas px-5 py-10">
      <div className="mx-auto max-w-3xl">
        <Card className="text-center">
          <span className={cn(
            'mx-auto grid size-24 place-items-center rounded-full border-4 text-2xl font-semibold',
            passed ? 'border-good/30 bg-good/10 text-good' : 'border-warn/30 bg-warn/10 text-warn',
          )}
          >
            {percent}%
          </span>
          <h1 className="mt-5 text-2xl font-semibold">{passed ? 'Optimus approved this solution.' : 'Review, then try again.'}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">
            {passed
              ? 'This System Design problem now counts toward your daily goal.'
              : `You scored ${score} of ${maxScore}. Passing needs ${Math.round(attempt.passRatio * 100)}%. A retry is a new paper.`}
          </p>
          <a href={`/system-design/${kind.toLowerCase()}`} className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-strong to-brand px-5 text-sm font-medium text-white">
            Return to System Design
          </a>
        </Card>

        <div className="mt-6 space-y-3">
          {attempt.questions.map((question, index) => (
            <ReviewCard key={question.id} index={index} question={question} review={byId.get(question.id)} answer={attempt.answers[question.id]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ index, question, review, answer }: {
  index: number;
  question: AssessmentQuestion;
  review?: AssessmentReviewItem;
  answer?: AssessmentAnswer;
}) {
  const scored = review?.score ?? 0;
  const full = scored >= question.weight;
  const title = question.type === 'mcq' ? question.prompt : question.title;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-dim">
            {index + 1} · {QUESTION_LABEL[question.type]}
          </p>
          <p className="mt-1 text-sm font-medium">{title}</p>
        </div>
        <span className={cn('shrink-0 rounded-lg px-2 py-1 font-mono text-xs', full ? 'bg-good/10 text-good' : scored > 0 ? 'bg-warn/10 text-warn' : 'bg-bad/10 text-bad')}>
          {scored}/{question.weight}
        </span>
      </div>

      {review?.feedback && <p className="mt-2 text-xs text-ink-muted">{review.feedback}</p>}

      {question.type === 'mcq' && review?.correctAnswers && (
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="text-ink-dim">You chose: {choiceValues(answer).join(', ') || '—'}</p>
          <p className="text-good">Correct: {review.correctAnswers.join(', ')}</p>
          {review.explanation && <p className="text-ink-muted">{review.explanation}</p>}
        </div>
      )}

      {review?.results && review.results.length > 0 && (
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {review.results.map((result) => (
            <li key={result.name} className="flex items-center gap-2 text-[11px] text-ink-muted">
              {result.passed ? <CheckCircle2 className="size-3 shrink-0 text-good" /> : <XCircle className="size-3 shrink-0 text-bad" />}
              <span className="truncate">{result.name}</span>
              {!result.visible && <span className="shrink-0 text-ink-dim">hidden</span>}
            </li>
          ))}
        </ul>
      )}

      {review?.bugSummary && (
        <p className="mt-3 rounded-lg border border-line bg-card p-2.5 text-xs text-ink-muted"><span className="text-ink-dim">The bug: </span>{review.bugSummary}</p>
      )}
      {review?.referenceQuery && (
        <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-card p-2.5 font-mono text-[11px] text-ink-muted">{review.referenceQuery}</pre>
      )}
      {review?.referenceSolution && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-brand-pale">Reference solution ({review.referenceSolution.language})</summary>
          <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-card p-2.5 font-mono text-[11px] text-ink-muted">{review.referenceSolution.source}</pre>
        </details>
      )}
      {review?.rubricNotes && <p className="mt-3 text-xs text-ink-dim">{review.rubricNotes}</p>}
    </Card>
  );
}
