import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Braces,
  BrainCircuit,
  Command,
  CornerDownLeft,
  LayoutDashboard,
  Search,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import type { SearchResult } from '@/lib/types';
import {
  createCommandSearchIndex,
  resultRecord,
  searchCommandIndex,
  type CommandSearchRecord,
} from '@/lib/commandSearch';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  to?: string;
  result?: SearchResult;
}

const QUICK_ACTIONS: CommandItem[] = [
  { id: 'dashboard', label: 'Open dashboard', detail: 'Today\'s set and progress', icon: LayoutDashboard, to: '/dashboard' },
  { id: 'dsa', label: 'Browse DSA problems', detail: 'Algorithms and data structures', icon: Braces, to: '/dsa' },
  { id: 'lld', label: 'Browse LLD', detail: 'Low Level Design catalogue', icon: BrainCircuit, to: '/system-design/lld' },
  { id: 'hld', label: 'Browse HLD', detail: 'High Level Design catalogue', icon: BrainCircuit, to: '/system-design/hld' },
  { id: 'blogs', label: 'Read write-ups', detail: 'Evidence-backed design articles', icon: BookOpen, to: '/blogs' },
  { id: 'settings', label: 'Open settings', detail: 'Profile, goals, and billing', icon: Settings, to: '/settings' },
];

function resultItem(result: SearchResult): CommandItem {
  return {
    id: `${result.type}:${result.id}`,
    label: result.title,
    detail: [result.kind, result.topic, result.difficulty].filter(Boolean).join(' · '),
    icon: result.type === 'blog' ? BookOpen : result.kind === 'DSA' ? Braces : BrainCircuit,
    result,
  };
}

function actionRecord(action: CommandItem): CommandSearchRecord {
  return {
    id: action.id,
    label: action.label,
    detail: action.detail,
    type: 'action',
    to: action.to ?? '',
    resultType: '',
    resultId: '',
    slug: '',
    kind: '',
    topic: '',
    subtopic: '',
    difficulty: '',
  };
}

function recordItem(record: CommandSearchRecord): CommandItem {
  if (record.type === 'action') {
    return QUICK_ACTIONS.find((action) => action.id === record.id) ?? {
      id: record.id,
      label: record.label,
      detail: record.detail,
      icon: Search,
      to: record.to,
    };
  }

  return resultItem({
    type: record.resultType as SearchResult['type'],
    id: record.resultId,
    slug: record.slug,
    title: record.label,
    kind: record.kind as SearchResult['kind'],
    topic: record.topic || null,
    subtopic: record.subtopic || null,
    difficulty: (record.difficulty || null) as SearchResult['difficulty'],
  });
}

function resultPath(result: SearchResult): string {
  if (result.type === 'blog') return `/blogs/${result.slug}`;
  const search = encodeURIComponent(result.title);
  return result.kind === 'DSA'
    ? `/dsa?search=${search}`
    : `/system-design/${result.kind.toLowerCase()}?search=${search}`;
}

export function CommandBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedQuery = query.trim();
  const hasSearch = normalizedQuery.length >= 2;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 120);
    return () => window.clearTimeout(timer);
  }, [query]);

  const indexQuery = useQuery({
    queryKey: ['command-search-index'],
    queryFn: api.searchIndex,
    enabled: open,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });

  const searchQuery = useQuery({
    queryKey: ['command-search', debouncedQuery.toLocaleLowerCase()],
    queryFn: () => api.search(debouncedQuery),
    enabled: open && debouncedQuery.length >= 2,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    placeholderData: (previous) => previous,
  });

  const commandIndex = useMemo(() => createCommandSearchIndex([
    ...QUICK_ACTIONS.map(actionRecord),
    ...(indexQuery.data?.items ?? []).map(resultRecord),
  ]), [indexQuery.data?.items]);

  const localItems = useMemo(() => {
    if (!hasSearch) return [];
    return searchCommandIndex(commandIndex, normalizedQuery).map(recordItem);
  }, [commandIndex, hasSearch, normalizedQuery]);

  const items = useMemo(() => {
    if (!hasSearch) return QUICK_ACTIONS;
    const remoteItems = debouncedQuery === normalizedQuery && !searchQuery.isPlaceholderData
      ? (searchQuery.data?.items ?? []).map(resultItem)
      : [];
    const seen = new Set<string>();
    return [...localItems, ...remoteItems].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [debouncedQuery, hasSearch, localItems, normalizedQuery, searchQuery.data?.items, searchQuery.isPlaceholderData]);

  const isSearching = hasSearch && (
    debouncedQuery !== normalizedQuery
    || searchQuery.isFetching
    || (indexQuery.isFetching && !indexQuery.data)
  );

  const close = () => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  };

  const select = (item: CommandItem) => {
    const to = item.result ? resultPath(item.result) : item.to;
    if (!to) return;
    close();
    navigate(to);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    close();
  }, [location.pathname]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(items.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && items[activeIndex]) {
      event.preventDefault();
      select(items[activeIndex]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-20 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-line-strong bg-card/95 px-3 py-2 text-xs text-ink-muted shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-brand/50 hover:text-ink lg:bottom-6 lg:right-8"
        aria-label="Open command bar"
      >
        <Search className="size-3.5 text-brand" />
        <span className="hidden sm:inline">Search Optimus</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-dim sm:inline-flex">
          <Command className="size-2.5" />K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Optimus command bar"
            className="mx-auto mt-[10vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-line-strong bg-card shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 shrink-0 text-brand" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search problems, topics, or write-ups…"
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
                aria-label="Search problems, topics, or write-ups"
                autoComplete="off"
              />
              <button type="button" onClick={close} className="rounded-md p-1.5 text-ink-dim hover:bg-elevated hover:text-ink" aria-label="Close command bar">
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[min(56vh,28rem)] overflow-y-auto p-2" role="listbox" aria-label="Command results">
              {isSearching && (
                <p className="px-3 py-3 text-center text-xs text-ink-dim">Searching the catalogue…</p>
              )}
              {hasSearch && !isSearching && !items.length && (
                <p className="px-3 py-8 text-center text-xs text-ink-dim">No matching problems or write-ups.</p>
              )}
              {!hasSearch && (
                <p className="px-3 pb-2 pt-1 text-[10px] uppercase tracking-[0.18em] text-ink-dim">Quick navigation</p>
              )}
              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => select(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                      index === activeIndex ? 'bg-brand/10 text-ink' : 'text-ink-muted hover:bg-elevated/70 hover:text-ink',
                    )}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-brand">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-ink-dim">{item.detail}</span>
                    </span>
                    {index === activeIndex && <CornerDownLeft className="size-3.5 shrink-0 text-ink-dim" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[10px] text-ink-dim">
              <span className="inline-flex items-center gap-1"><ArrowUp className="size-3" /><ArrowDown className="size-3" /> navigate</span>
              <span className="inline-flex items-center gap-1"><CornerDownLeft className="size-3" /> open</span>
              <span className="ml-auto">Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
