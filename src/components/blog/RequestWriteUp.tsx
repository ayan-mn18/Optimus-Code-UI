import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, FileSearch, Loader2, Plus, X } from 'lucide-react';
import { Button, Card } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { ResearchAudience, ResearchBrief, ResearchFormat } from '@/lib/types';
import { useActiveJobId, useCancelResearch, useResearchJob, useResearchStatus, useStartResearch } from '@/hooks/useResearch';

const STAGES = ['intake', 'resolve', 'harvest', 'extract', 'compose', 'validate', 'publish'] as const;

const AUDIENCES: { value: ResearchAudience; label: string }[] = [
  { value: 'interview', label: 'Interview preparation' },
  { value: 'beginner', label: 'New to the topic' },
  { value: 'intermediate', label: 'Working engineer' },
  { value: 'senior', label: 'Senior / staff engineer' },
];

const FORMATS: { value: ResearchFormat; label: string; hint: string }[] = [
  { value: 'interview-guide', label: 'Interview guide', hint: 'Clarifications, design, trade-offs, and follow-ups' },
  { value: 'deep-dive', label: 'Deep dive', hint: 'Mechanics, internals, failure modes, and examples' },
  { value: 'decision-guide', label: 'Decision guide', hint: 'Compare choices and explain when each fits' },
  { value: 'comparison', label: 'Comparison', hint: 'A focused side-by-side of two or more approaches' },
];

const EXAMPLES = [
  { topic: 'Design a distributed rate limiter', goal: 'Prepare for a system design interview where I need to explain correctness under high traffic.' },
  { topic: 'When should I use Kafka versus a queue?', goal: 'Make a practical architecture choice for asynchronous jobs and explain the trade-offs clearly.' },
  { topic: 'Design an offline-first notes app', goal: 'Understand sync conflicts, storage choices, and the failure cases I should discuss in an interview.' },
];

export function RequestWriteUp() {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState<ResearchAudience>('interview');
  const [format, setFormat] = useState<ResearchFormat>('interview-guide');
  const [questions, setQuestions] = useState(['']);
  const [constraints, setConstraints] = useState('');
  const [jobId, setJobId] = useActiveJobId();
  const start = useStartResearch();
  const cancel = useCancelResearch();
  const researchStatus = useResearchStatus();
  const { data } = useResearchJob(jobId);

  const job = data?.job;
  const running = job?.status === 'queued' || job?.status === 'running';
  const cleanQuestions = questions.map((question) => question.trim()).filter(Boolean);
  const canSubmit = topic.trim().length >= 4
    && goal.trim().length >= 20
    && cleanQuestions.length > 0
    && cleanQuestions.every((question) => question.length >= 8);

  const submit = async () => {
    if (!canSubmit) return;
    const brief: ResearchBrief = {
      topic: topic.trim(),
      goal: goal.trim(),
      audience,
      format,
      questions: cleanQuestions,
      constraints: constraints.trim(),
    };
    const { job: created } = await start.mutateAsync(brief);
    setJobId(created.id);
  };

  const updateQuestion = (index: number, value: string) => {
    setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? value : question));
  };

  const reached = STAGES.findIndex((stage) => job?.stage?.startsWith(stage));
  const latest = job?.progress?.at(-1)?.message;
  const jobBrief = job?.brief;
  const unavailable = researchStatus.data && !researchStatus.data.available;

  if (unavailable && !running) {
    return (
      <Card className="border-line bg-surface/40 px-5 py-5 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-dim">Research brief</p>
        <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">On-demand research is not connected yet</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
          The brief builder is ready, but this workspace still needs its web research connection enabled. Try again after it is configured.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {!running && (
        <>
          <div className="border-b border-line px-5 py-5 sm:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-pale">Research brief</p>
            <h2 className="mt-1.5 flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
              <FileSearch className="size-4 text-brand" />
              Create a write-up for a real question
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Give the researcher your context and the questions you need answered. It will search, cross-check sources,
              and return a draft for you to review before it is published.
            </p>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.6fr)]">
              <label className="block">
                <span className="text-xs font-medium text-ink-muted">Topic</span>
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Design a distributed rate limiter"
                  aria-label="Research topic"
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-surface/80 px-3 text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink-muted">Who is this for?</span>
                <select
                  value={audience}
                  onChange={(event) => setAudience(event.target.value as ResearchAudience)}
                  aria-label="Research audience"
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted focus:border-brand/70 focus:outline-none"
                >
                  {AUDIENCES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-ink-muted">What should this help you do?</span>
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Describe the decision, interview, or implementation you are preparing for."
                aria-label="Research goal"
                rows={2}
                className="mt-1.5 w-full resize-y rounded-lg border border-line bg-surface/80 px-3 py-2.5 text-sm leading-relaxed placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
              />
            </label>

            <div>
              <span className="text-xs font-medium text-ink-muted">What format would be most useful?</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {FORMATS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-left transition-colors',
                      format === option.value ? 'border-brand/50 bg-brand/10' : 'border-line bg-surface/50 hover:border-brand/30',
                    )}
                  >
                    <span className="block text-xs font-medium text-ink">{option.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-dim">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-medium text-ink-muted">Questions the article must answer</span>
                  <span className="ml-2 text-[11px] text-ink-dim">Add up to five</span>
                </div>
                {questions.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setQuestions((current) => [...current, ''])}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-pale hover:text-ink"
                  >
                    <Plus className="size-3.5" /> Add question
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-elevated text-[10px] text-ink-dim">{index + 1}</span>
                    <input
                      value={question}
                      onChange={(event) => updateQuestion(index, event.target.value)}
                      placeholder={index === 0 ? 'e.g. How do we keep limits correct across regions?' : 'Another question or follow-up'}
                      aria-label={`Research question ${index + 1}`}
                      className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface/80 px-3 text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))}
                        className="rounded-md p-1.5 text-ink-dim hover:bg-elevated hover:text-ink"
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Constraints or context <span className="font-normal text-ink-dim">(optional)</span></span>
              <textarea
                value={constraints}
                onChange={(event) => setConstraints(event.target.value)}
                placeholder="Scale, language, cloud, existing stack, or anything the researcher should respect."
                aria-label="Research constraints"
                rows={2}
                className="mt-1.5 w-full resize-y rounded-lg border border-line bg-surface/80 px-3 py-2.5 text-sm leading-relaxed placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="max-w-lg text-[11px] leading-relaxed text-ink-dim">The draft is grounded in fetched sources and stays in review until you approve it.</p>
              <Button size="sm" onClick={submit} loading={start.isPending} disabled={!canSubmit}>Start research</Button>
            </div>
          </div>

          <div className="border-t border-line bg-surface/30 px-5 py-3 sm:px-6">
            <span className="mr-2 text-[11px] text-ink-dim">Need a starting point?</span>
            <div className="inline-flex flex-wrap gap-1.5 align-middle">
              {EXAMPLES.map((example) => (
                <button
                  key={example.topic}
                  type="button"
                  onClick={() => { setTopic(example.topic); setGoal(example.goal); }}
                  className="rounded-md border border-line bg-elevated/60 px-2 py-1 text-[11px] text-ink-muted hover:border-brand/40 hover:text-ink"
                >
                  {example.topic}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {start.isError && (
        <p role="alert" className="border-t border-bad/30 bg-bad/10 px-5 py-3 text-xs text-bad sm:px-6">{start.error.message}</p>
      )}

      {job && (
        <div className="border-t border-line px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-brand-pale">Research in progress</p>
              <p className="mt-1 text-sm font-medium text-ink">{jobBrief?.topic ?? job.request}</p>
              {jobBrief?.goal && <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-dim">{jobBrief.goal}</p>}
            </div>
            {running && <Button size="sm" variant="ghost" onClick={() => cancel.mutate(job.id)} icon={<X className="size-3.5" />}>Cancel</Button>}
          </div>

          <ol className="mt-4 grid gap-2 sm:grid-cols-7">
            {STAGES.map((stage, index) => {
              const done = reached > index || job.status === 'published' || job.status === 'needs_review';
              const active = reached === index && running;
              return (
                <li key={stage} className={cn('flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] uppercase tracking-wider', done ? 'border-good/30 bg-good/10 text-good' : active ? 'border-brand/40 bg-brand/10 text-brand-pale' : 'border-line text-ink-dim')}>
                  {done && <Check className="size-2.5" />}
                  {active && <Loader2 className="size-2.5 animate-spin" />}
                  {stage}
                </li>
              );
            })}
          </ol>

          {latest && running && <p className="mt-3 font-mono text-[11px] text-ink-dim">{latest}</p>}

          {job.status === 'failed' && (
            <p className="mt-3 flex items-start gap-1.5 text-xs text-bad"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{job.error ?? 'The research run failed.'}</p>
          )}

          {(job.status === 'needs_review' || job.status === 'published') && job.slug && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link to={`/blogs/${job.slug}`}><Button size="sm" variant="outline">Review the draft</Button></Link>
              <Link to={`/blogs/${job.slug}/edit`}><Button size="sm" variant="ghost">Edit and publish</Button></Link>
              <button type="button" onClick={() => setJobId(null)} className="text-[11px] text-ink-dim hover:text-ink">Dismiss</button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
