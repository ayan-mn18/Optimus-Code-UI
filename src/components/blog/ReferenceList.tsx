import { BookOpen, Code2, FileText, Link2, MessagesSquare, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogRef } from '@/lib/types';

const KIND_ICON = {
  problem: Code2,
  article: FileText,
  discussion: MessagesSquare,
  video: Youtube,
  repo: BookOpen,
  other: Link2,
} as const;

const KIND_LABEL = {
  problem: 'Problem',
  article: 'Article',
  discussion: 'Discussion',
  video: 'Video',
  repo: 'Repository',
  other: 'Link',
} as const;

const ORDER: BlogRef['kind'][] = ['problem', 'article', 'video', 'discussion', 'repo', 'other'];

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Every source the write-up was built from, grouped by what kind of source it is. */
export function ReferenceList({ refs }: { refs: BlogRef[] }) {
  if (!refs.length) return null;

  const groups = ORDER
    .map((kind) => ({ kind, items: refs.filter((ref) => ref.kind === kind) }))
    .filter((group) => group.items.length);

  return (
    <section aria-labelledby="references" className="card p-5">
      <h2 id="references" className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Link2 className="size-4 text-accent" />
        References
      </h2>
      <p className="mt-1 text-xs text-ink-dim">Where this write-up came from. All links open in a new tab.</p>

      <div className="mt-4 space-y-5">
        {groups.map(({ kind, items }) => {
          const Icon = KIND_ICON[kind];
          return (
            <div key={kind}>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-dim">
                <Icon className="size-3" /> {KIND_LABEL[kind]}
              </p>
              <ul className="space-y-1.5">
                {items.map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={cn(
                        'group flex flex-col gap-1 rounded-xl border border-line bg-surface/50 px-3.5 py-2.5',
                        'transition-colors hover:border-brand/40 hover:bg-elevated/50',
                      )}
                    >
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-sm font-medium text-ink group-hover:text-brand-pale">{ref.title}</span>
                        <span className="font-mono text-[11px] text-ink-dim">{ref.source ?? hostOf(ref.url)}</span>
                      </span>
                      {ref.note && <span className="text-xs leading-relaxed text-ink-dim">{ref.note}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
