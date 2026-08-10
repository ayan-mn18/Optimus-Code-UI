import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { Button, Card, EmptyState, Skeleton, Chip } from '@/components/ui/primitives';
import { ProblemRow } from '@/components/dashboard/ProblemRow';
import { useProblems, useToggleSolve } from '@/hooks/useChallenge';
import { cn } from '@/lib/utils';
import type { Difficulty, Problem } from '@/lib/types';

type SolveStatus = 'all' | 'unsolved' | 'solved';

const PAGE_SIZE = 20;
const EMPTY_PROBLEMS: Problem[] = [];
const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'Easy', 'Medium', 'Hard'];
const STATUSES: { value: SolveStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'solved', label: 'Solved' },
];

export function Problems() {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<SolveStatus>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProblems();
  const toggle = useToggleSolve();
  const allItems = data?.items ?? EMPTY_PROBLEMS;

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const problem of allItems) counts.set(problem.topic, (counts.get(problem.topic) ?? 0) + 1);
    return [...counts.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return allItems.filter((problem) => {
      if (term && !problem.title.toLocaleLowerCase().includes(term)) return false;
      if (topic !== 'all' && problem.topic !== topic) return false;
      if (difficulty !== 'all' && problem.difficulty !== difficulty) return false;
      if (status === 'solved' && !problem.solved) return false;
      if (status === 'unsolved' && problem.solved) return false;
      return true;
    });
  }, [allItems, difficulty, search, status, topic]);

  const solvedCount = filteredItems.filter((problem) => problem.solved).length;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredItems.slice(firstIndex, firstIndex + PAGE_SIZE);
  const firstResult = filteredItems.length ? firstIndex + 1 : 0;
  const lastResult = Math.min(firstIndex + PAGE_SIZE, filteredItems.length);

  const onToggle = (problem: Problem, solved: boolean) => toggle.mutate({ problem, solved });
  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const updateTopic = (value: string) => {
    setTopic(value);
    setPage(1);
  };
  const updateDifficulty = (value: Difficulty | 'all') => {
    setDifficulty(value);
    setPage(1);
  };
  const updateStatus = (value: SolveStatus) => {
    setStatus(value);
    setPage(1);
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-dim">Library</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">All problems</h1>
        <p className="mt-1 text-sm text-ink-muted">
          The Striver SDE and A2Z sheets, merged and deduped. Anything you tick here beyond today&rsquo;s five
          counts as a bonus solve.
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
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search by title…"
              className="h-9 w-full rounded-lg border border-line bg-surface/80 pl-9 pr-3 text-sm placeholder:text-ink-dim hover:border-line-strong focus:border-brand/70 focus:outline-none"
            />
          </label>

          <select
            value={topic}
            onChange={(event) => updateTopic(event.target.value)}
            aria-label="Filter by topic"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted hover:border-line-strong focus:border-brand/70 focus:outline-none"
          >
            <option value="all">All topics</option>
            {topics.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name} ({entry.total})
              </option>
            ))}
          </select>

          <SegmentedControl
            options={DIFFICULTIES.map((value) => ({ value, label: value === 'all' ? 'Any' : value }))}
            value={difficulty}
            onChange={(value) => updateDifficulty(value as Difficulty | 'all')}
          />

          <SegmentedControl options={STATUSES} value={status} onChange={updateStatus} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-dim">
          <SlidersHorizontal className="size-3" />
          <span>
            Showing {firstResult}&ndash;{lastResult} of {filteredItems.length}{' '}
            {filteredItems.length === 1 ? 'problem' : 'problems'}
          </span>
          {filteredItems.length !== (data?.total ?? 0) && <span>from {data?.total ?? 0} total</span>}
          {solvedCount > 0 && <Chip className="border-good/25 bg-good/10 text-good">{solvedCount} solved</Chip>}
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredItems.length ? (
        <div className="space-y-4">
          <ul className="space-y-2">
            {pageItems.map((problem, index) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                index={index}
                onToggle={onToggle}
                pending={toggle.isPending && toggle.variables?.problem.id === problem.id}
              />
            ))}
          </ul>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
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

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pageItems = paginationItems(page, totalPages);

  return (
    <nav aria-label="Problem pages" className="flex items-center justify-between gap-3 border-t border-line pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" /> Previous
      </Button>

      <span className="text-xs text-ink-dim sm:hidden">
        Page {page} of {totalPages}
      </span>
      <div className="hidden items-center gap-1 sm:flex">
        {pageItems.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              aria-label={`Go to page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                'grid size-8 place-items-center rounded-lg text-xs transition-colors',
                item === page ? 'bg-brand-strong text-white' : 'text-ink-dim hover:bg-elevated hover:text-ink',
              )}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="grid size-8 place-items-center text-xs text-ink-dim" aria-hidden>
              &hellip;
            </span>
          ),
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next <ChevronRight className="size-4" />
      </Button>
    </nav>
  );
}

function paginationItems(page: number, totalPages: number): (number | string)[] {
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
  const items: (number | string)[] = [];

  for (const current of pages) {
    const previous = items.at(-1);
    if (typeof previous === 'number' && current - previous > 1) items.push(`gap-${previous}`);
    items.push(current);
  }

  return items;
}
