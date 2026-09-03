import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Search, Sparkles, Youtube } from 'lucide-react';
import { Button, Card, Chip, DifficultyBadge, EmptyState, Skeleton } from '@/components/ui/primitives';
import { useCreateAssessment, useSystemDesign } from '@/hooks/useSystemDesign';
import { cn, youtubeWatchUrl } from '@/lib/utils';
import type { Difficulty, Problem } from '@/lib/types';

type SolveStatus = 'all' | 'solved' | 'unsolved';
const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'Easy', 'Medium', 'Hard'];
const PAGE_SIZES = [10, 20, 40] as const;

export function SystemDesign() {
  const params = useParams();
  const kind = params.kind?.toLowerCase() === 'hld' ? 'HLD' : 'LLD';
  const query = useSystemDesign(kind);
  const createAssessment = useCreateAssessment();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<SolveStatus>('all');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(20);

  useEffect(() => {
    setPage(1);
  }, [difficulty, kind, pageSize, search, status, topic]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (query.data?.items ?? []).filter((problem) => {
      if (term && !`${problem.title} ${problem.topic} ${problem.subtopic ?? ''}`.toLocaleLowerCase().includes(term)) return false;
      if (topic !== 'all' && problem.topic !== topic) return false;
      if (difficulty !== 'all' && problem.difficulty !== difficulty) return false;
      if (status === 'solved' && !problem.solved) return false;
      if (status === 'unsolved' && problem.solved) return false;
      return true;
    });
  }, [difficulty, query.data?.items, search, status, topic]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(firstIndex, firstIndex + pageSize);
  const firstResult = pageItems.length ? firstIndex + 1 : 0;
  const lastResult = firstIndex + pageItems.length;

  const groups = useMemo(() => {
    const grouped = new Map<string, Problem[]>();
    for (const problem of pageItems) grouped.set(problem.topic, [...(grouped.get(problem.topic) ?? []), problem]);
    return [...grouped.entries()];
  }, [pageItems]);

  const filtersActive = Boolean(search || topic !== 'all' || difficulty !== 'all' || status !== 'all');
  const resetFilters = () => {
    setSearch('');
    setTopic('all');
    setDifficulty('all');
    setStatus('all');
  };

  const startAssessment = async (problem: Problem) => {
    const response = await createAssessment.mutateAsync(problem.id);
    navigate(`/optimus/${response.attempt.id}`);
  };

  const toggleTopic = (name: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-dim">System Design · {kind}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Build systems. <span className="gradient-text">Defend every choice.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Study each concept, then pass a ten-question Optimus assessment. Only passed assessments count as complete.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Card className="min-w-28 p-3">
            <p className="text-xl font-semibold">{query.data?.catalogTotal ?? '—'}</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-dim">{kind} items</p>
          </Card>
          <Card className="min-w-28 p-3">
            <p className="text-xl font-semibold">
              {query.data?.items.filter((problem) => problem.solved).length ?? '—'}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-ink-dim">Completed</p>
          </Card>
        </div>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-dim" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search concepts or problems"
              aria-label="Search System Design"
              className="h-9 w-full rounded-lg border border-line bg-surface/80 pl-9 pr-3 text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
            />
          </label>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            aria-label="Filter by topic"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted"
          >
            <option value="all">All topics</option>
            {query.data?.topics.map((entry) => <option key={entry.topic} value={entry.topic}>{entry.topic} ({entry.total})</option>)}
          </select>
          <div className="inline-flex rounded-lg border border-line bg-surface/80 p-0.5">
            {DIFFICULTIES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDifficulty(value)}
                className={cn('rounded-md px-2.5 py-1.5 text-xs', difficulty === value ? 'bg-elevated text-ink' : 'text-ink-dim')}
              >
                {value === 'all' ? 'Any' : value}
              </button>
            ))}
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as SolveStatus)}
            aria-label="Filter by completion"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted"
          >
            <option value="all">Any status</option>
            <option value="unsolved">Not completed</option>
            <option value="solved">Completed</option>
          </select>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value) as (typeof PAGE_SIZES)[number])}
            aria-label="Items per page"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted"
          >
            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}
          </select>
          {filtersActive && (
            <Button size="sm" variant="ghost" onClick={resetFilters} icon={<RotateCcw className="size-3.5" />}>Reset</Button>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] text-ink-dim">
          <span>Showing {firstResult}–{lastResult} of {filtered.length} matching items</span>
          <span>Videos open on YouTube when available.</span>
        </div>
      </Card>

      {createAssessment.isError && (
        <p role="alert" className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
          {createAssessment.error.message}
        </p>
      )}

      {query.isError ? (
        <Card className="border-bad/30">
          <p className="text-sm font-medium text-bad">Could not load the {kind} catalog.</p>
          <p className="mt-1 text-xs text-ink-dim">{query.error.message}</p>
          <Button className="mt-4" size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button>
        </Card>
      ) : query.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>
      ) : groups.length ? (
        <div className="space-y-3">
          {groups.map(([name, problems], groupIndex) => {
            const closed = collapsed.has(name);
            return (
              <section key={name} className="card overflow-hidden">
                <button
                  type="button"
                  aria-expanded={!closed}
                  onClick={() => toggleTopic(name)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className="grid size-9 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-xs font-semibold text-brand-pale">
                    {String(groupIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{name}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-dim">{problems.length} items · topic-wise progression</span>
                  </span>
                  <ChevronDown className={cn('size-4 text-ink-dim transition-transform', closed && '-rotate-90')} />
                </button>
                {!closed && (
                  <ul className="divide-y divide-line border-t border-line">
                    {problems.map((problem) => (
                      <li key={problem.id} className="flex flex-col gap-3 px-4 py-3 hover:bg-elevated/40 sm:flex-row sm:items-center">
                        <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border', problem.solved ? 'border-good/40 bg-good/10 text-good' : 'border-line-strong text-transparent')}>
                          <CheckCircle2 className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{problem.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {problem.subtopic && <Chip>{problem.subtopic}</Chip>}
                            <DifficultyBadge difficulty={problem.difficulty} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {problem.youtube_url && (
                            <a
                              href={youtubeWatchUrl(problem.youtube_url)}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Watch ${problem.title} on YouTube`}
                              title="Watch on YouTube"
                              className="grid size-9 place-items-center rounded-lg text-ink-dim hover:bg-elevated hover:text-brand"
                            >
                              <Youtube className="size-4" />
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant={problem.solved ? 'outline' : 'primary'}
                            loading={createAssessment.isPending && createAssessment.variables === problem.id}
                            onClick={() => startAssessment(problem)}
                            icon={<Sparkles className="size-3.5" />}
                          >
                            {problem.solved ? 'Review' : 'Start Optimus'}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState icon={<Search className="size-6" />} title="Nothing matches" body="Try another topic or difficulty." />
      )}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const candidates = [1, page - 1, page, page + 1, totalPages]
    .filter((value) => value >= 1 && value <= totalPages);
  const pages = [...new Set(candidates)].sort((a, b) => a - b);

  return (
    <nav aria-label="System Design pages" className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <Button size="sm" variant="outline" disabled={page === 1} onClick={() => onPageChange(page - 1)} icon={<ChevronLeft className="size-4" />}>Previous</Button>
      <div className="flex items-center gap-1">
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          return (
            <span key={value} className="contents">
              {previous && value - previous > 1 && <span className="px-1 text-xs text-ink-dim">…</span>}
              <button
                type="button"
                aria-current={value === page ? 'page' : undefined}
                onClick={() => onPageChange(value)}
                className={cn('grid size-8 place-items-center rounded-lg text-xs transition-colors', value === page ? 'bg-brand-strong text-white' : 'text-ink-dim hover:bg-elevated hover:text-ink')}
              >
                {value}
              </button>
            </span>
          );
        })}
      </div>
      <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next <ChevronRight className="size-4" /></Button>
    </nav>
  );
}
