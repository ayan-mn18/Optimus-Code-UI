import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, Loader2, Sparkles, X } from 'lucide-react';
import { Button, Card } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { useActiveJobId, useCancelResearch, useResearchJob, useStartResearch } from '@/hooks/useResearch';

/**
 * Asks the server to research and write a topic that does not exist yet.
 *
 * The run takes minutes, so this starts a job and polls it. The stages are the
 * pipeline's own, so a run that dies at harvest says so rather than spinning.
 */

const STAGES = ['intake', 'resolve', 'harvest', 'extract', 'compose', 'validate', 'publish'] as const;

const EXAMPLES = ['Design a text editor', 'Design a distributed lock', 'Design an LFU cache'];

export function RequestWriteUp() {
  const [topic, setTopic] = useState('');
  const [jobId, setJobId] = useActiveJobId();
  const start = useStartResearch();
  const cancel = useCancelResearch();
  const { data } = useResearchJob(jobId);

  const job = data?.job;
  const running = job?.status === 'queued' || job?.status === 'running';

  const submit = async () => {
    if (topic.trim().length < 8) return;
    const { job: created } = await start.mutateAsync(topic.trim());
    setJobId(created.id);
    setTopic('');
  };

  // Which stage we are on, derived from the most recent progress line.
  const reached = STAGES.findIndex((stage) => job?.stage?.startsWith(stage));
  const latest = job?.progress?.at(-1)?.message;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles className="size-4 text-brand" />
            Ask for a write-up
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink-dim">
            Name a design topic and the server researches it — searching, reading sources, and drafting an article
            with company tags it can prove. Takes a few minutes.
          </p>
        </div>
      </div>

      {!running && (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
              placeholder="Design a text editor"
              aria-label="Topic to research"
              className="h-9 min-w-52 flex-1 rounded-lg border border-line bg-surface/80 px-3 text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
            />
            <Button
              size="sm"
              onClick={submit}
              loading={start.isPending}
              disabled={topic.trim().length < 8}
              icon={<Sparkles className="size-3.5" />}
            >
              Research it
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-dim">Try</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setTopic(example)}
                className="rounded-md border border-line bg-elevated/60 px-1.5 py-0.5 text-[11px] text-ink-muted hover:border-brand/40 hover:text-ink"
              >
                {example}
              </button>
            ))}
          </div>
        </>
      )}

      {start.isError && (
        <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
          {start.error.message}
        </p>
      )}

      {job && (
        <div className="rounded-xl border border-line bg-surface/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-ink">{job.request}</p>
            {running && (
              <Button size="sm" variant="ghost" onClick={() => cancel.mutate(job.id)} icon={<X className="size-3.5" />}>
                Cancel
              </Button>
            )}
          </div>

          <ol className="mt-3 flex flex-wrap gap-1.5">
            {STAGES.map((stage, index) => {
              const done = reached > index || job.status === 'published' || job.status === 'needs_review';
              const active = reached === index && running;
              return (
                <li
                  key={stage}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider',
                    done ? 'border-good/30 bg-good/10 text-good'
                      : active ? 'border-brand/40 bg-brand/10 text-brand-pale'
                        : 'border-line text-ink-dim',
                  )}
                >
                  {done && <Check className="size-2.5" />}
                  {active && <Loader2 className="size-2.5 animate-spin" />}
                  {stage}
                </li>
              );
            })}
          </ol>

          {latest && running && <p className="mt-2 font-mono text-[11px] text-ink-dim">{latest}</p>}

          {job.status === 'failed' && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-bad">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {job.error ?? 'The run failed.'}
            </p>
          )}

          {(job.status === 'needs_review' || job.status === 'published') && job.slug && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link to={`/blogs/${job.slug}`}>
                <Button size="sm" variant="outline">Read the draft</Button>
              </Link>
              <Link to={`/blogs/${job.slug}/edit`}>
                <Button size="sm" variant="ghost">Review and publish</Button>
              </Link>
              <button type="button" onClick={() => setJobId(null)} className="text-[11px] text-ink-dim hover:text-ink">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
