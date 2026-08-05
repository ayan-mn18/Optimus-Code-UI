import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Card, EmptyState, Skeleton, Chip } from '@/components/ui/primitives';
import { ProblemRow } from '@/components/dashboard/ProblemRow';
import { useProblems, useToggleSolve, useTopics } from '@/hooks/useChallenge';
import { cn } from '@/lib/utils';
import type { Difficulty, Problem } from '@/lib/types';

const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'Easy', 'Medium', 'Hard'];
const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'solved', label: 'Solved' },
];

export function Problems() {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState('all');

  const filters = useMemo(
    () => ({ topic, difficulty, status, search: search.trim() }),
    [topic, difficulty, status, search],
  );

  const { data, isLoading } = useProblems(filters);
  const { data: topicsData } = useTopics();
  const toggle = useToggleSolve();

  const onToggle = (problem: Problem, solved: boolean) => toggle.mutate({ problem, solved });
  const items = data?.items ?? [];
  const solvedCount = items.filter((item) => item.solved).length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-dim">Library</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">All problems</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The full Striver SDE Sheet. Anything you tick here beyond today&rsquo;s five counts as a bonus solve.
        </p>
      </div>

      {/* ---- filters, one row above the list ------------------------------- */}
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-52 flex-1">
            <span className="sr-only">Search problems</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-dim" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title…"
              className="h-9 w-full rounded-lg border border-line bg-surface/80 pl-9 pr-3 text-sm placeholder:text-ink-dim hover:border-line-strong focus:border-brand/70 focus:outline-none"
            />
          </label>

          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            aria-label="Filter by topic"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted hover:border-line-strong focus:border-brand/70 focus:outline-none"
          >
            <option value="all">All topics</option>
            {topicsData?.topics.map((entry) => (
              <option key={entry.topic} value={entry.topic}>
                {entry.topic} ({entry.total})
              </option>
            ))}
          </select>

          <SegmentedControl
            options={DIFFICULTIES.map((value) => ({ value, label: value === 'all' ? 'Any' : value }))}
            value={difficulty}
            onChange={(value) => setDifficulty(value as Difficulty | 'all')}
          />

          <SegmentedControl options={STATUSES} value={status} onChange={setStatus} />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-dim">
          <SlidersHorizontal className="size-3" />
          <span>
            Showing {items.length} {items.length === 1 ? 'problem' : 'problems'}
          </span>
          {solvedCount > 0 && <Chip className="border-good/25 bg-good/10 text-good">{solvedCount} solved</Chip>}
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : items.length ? (
        <ul className="space-y-2">
          {items.map((problem, index) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              index={index}
              onToggle={onToggle}
              pending={toggle.isPending && toggle.variables?.problem.id === problem.id}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Search className="size-6" />}
          title="Nothing matches those filters"
          body="Try clearing the search or widening the topic and difficulty."
        />
      )}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface/80 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs transition-colors',
            value === option.value ? 'bg-elevated text-ink' : 'text-ink-dim hover:text-ink-muted',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
