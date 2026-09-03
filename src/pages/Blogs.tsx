import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileEdit, PenLine, RotateCcw, Search, Sparkles } from 'lucide-react';
import { Button, Card, Chip, EmptyState, Skeleton } from '@/components/ui/primitives';
import { BlogCard } from '@/components/blog/BlogCard';
import { useBlogs, useMyBlogs } from '@/hooks/useBlogs';
import { cn } from '@/lib/utils';

const KINDS = ['all', 'LLD', 'HLD', 'DSA', 'General'] as const;
const SORTS = [
  { value: 'recent', label: 'Newest' },
  { value: 'popular', label: 'Most read' },
  { value: 'liked', label: 'Most liked' },
] as const;

export function Blogs() {
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all');
  const [topic, setTopic] = useState('all');
  const [company, setCompany] = useState('all');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState<(typeof SORTS)[number]['value']>('recent');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [company, debounced, kind, sort, tag, topic]);

  const query = useBlogs({ kind, topic, company, tag, sort, search: debounced, page });
  const mine = useMyBlogs();

  const facets = query.data?.facets;
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / (query.data?.pageSize ?? 12)));
  const drafts = useMemo(() => (mine.data?.items ?? []).filter((blog) => blog.status === 'draft'), [mine.data]);

  const filtersActive = kind !== 'all' || topic !== 'all' || company !== 'all' || tag !== 'all' || Boolean(search);
  const resetFilters = () => {
    setKind('all');
    setTopic('all');
    setCompany('all');
    setTag('all');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-dim">Blogs</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Design write-ups, <span className="gradient-text">with receipts.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Every article ends with the companies the question was reported at and the sources it was built from.
            Write your own, or read the ones already published.
          </p>
        </div>
        <Link to="/blogs/new">
          <Button icon={<PenLine className="size-4" />}>Write a blog</Button>
        </Link>
      </div>

      {drafts.length > 0 && (
        <Card className="border-warn/25 bg-warn/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-warn">
            <FileEdit className="size-4" />
            {drafts.length} unpublished draft{drafts.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <Link
                  to={`/blogs/${draft.slug}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface/70 px-2.5 py-1.5 text-xs text-ink-muted hover:border-brand/40 hover:text-ink"
                >
                  {draft.coverEmoji} {draft.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-dim" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search write-ups"
              aria-label="Search blogs"
              className="h-9 w-full rounded-lg border border-line bg-surface/80 pl-9 pr-3 text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
            />
          </label>
          <div className="inline-flex rounded-lg border border-line bg-surface/80 p-0.5">
            {KINDS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={cn('rounded-md px-2.5 py-1.5 text-xs', kind === value ? 'bg-elevated text-ink' : 'text-ink-dim')}
              >
                {value === 'all' ? 'All' : value}
              </button>
            ))}
          </div>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            aria-label="Filter by topic"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted"
          >
            <option value="all">All topics</option>
            {facets?.topics.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
          <select
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            aria-label="Filter by company"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted"
          >
            <option value="all">Any company</option>
            {facets?.companies.map((entry) => (
              <option key={entry.name} value={entry.name}>{entry.name} ({entry.blogs})</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            aria-label="Sort blogs"
            className="h-9 rounded-lg border border-line bg-surface/80 px-3 text-sm text-ink-muted"
          >
            {SORTS.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
          </select>
          {filtersActive && (
            <Button size="sm" variant="ghost" onClick={resetFilters} icon={<RotateCcw className="size-3.5" />}>Reset</Button>
          )}
        </div>

        {facets?.tags.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-dim">Tags</span>
            <button type="button" onClick={() => setTag('all')}>
              <Chip className={cn(tag === 'all' && 'border-brand/40 bg-brand/10 text-brand-pale')}>All</Chip>
            </button>
            {facets.tags.map((entry) => (
              <button key={entry} type="button" onClick={() => setTag(entry === tag ? 'all' : entry)}>
                <Chip className={cn(entry === tag && 'border-brand/40 bg-brand/10 text-brand-pale')}>{entry}</Chip>
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      {query.isError ? (
        <Card className="border-bad/30">
          <p className="text-sm font-medium text-bad">Could not load blogs.</p>
          <p className="mt-1 text-xs text-ink-dim">{query.error.message}</p>
          <Button className="mt-4" size="sm" variant="outline" onClick={() => query.refetch()}>Retry</Button>
        </Card>
      ) : query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-56 rounded-2xl" />)}
        </div>
      ) : query.data?.items.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data.items.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
          </div>
          {totalPages > 1 && (
            <nav aria-label="Blog pages" className="flex items-center justify-between gap-3 border-t border-line pt-4">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)} icon={<ChevronLeft className="size-4" />}>
                Previous
              </Button>
              <span className="text-xs text-ink-dim">Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title={filtersActive ? 'Nothing matches' : 'No write-ups yet'}
          body={filtersActive ? 'Try another company or topic.' : 'Be the first — publish one from your own notes.'}
        />
      )}
    </div>
  );
}
