import { Link } from 'react-router-dom';
import { Clock, Eye, Heart } from 'lucide-react';
import { Chip, DifficultyBadge } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { Blog } from '@/lib/types';

const ORIGIN_LABEL: Record<Blog['origin'], string> = {
  editorial: 'Optimus editorial',
  pipeline: 'Researched',
  user: 'Community',
};

export function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className={cn(
        'card group flex h-full flex-col p-5 transition-all duration-150',
        'hover:-translate-y-0.5 hover:border-brand/40',
      )}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-elevated/70 text-xl">
          {blog.coverEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip className="border-brand/25 bg-brand/10 text-brand-pale">{blog.kind}</Chip>
            {blog.difficulty && <DifficultyBadge difficulty={blog.difficulty} />}
            {blog.status === 'draft' && <Chip className="border-warn/30 text-warn">Draft</Chip>}
          </div>
          <h3 className="mt-2 text-[15px] font-semibold leading-snug text-ink group-hover:text-brand-pale">
            {blog.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">{blog.summary}</p>

      {blog.companies.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {blog.companies.slice(0, 4).map((company) => <Chip key={company.name}>{company.name}</Chip>)}
          {blog.companies.length > 4 && (
            <span className="text-[11px] text-ink-dim">+{blog.companies.length - 4} more</span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center gap-3 pt-4 text-[11px] text-ink-dim">
        <span className="truncate">{blog.author.name}</span>
        <span className="rounded border border-line px-1 py-px text-[10px]">{ORIGIN_LABEL[blog.origin]}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2.5 tabular-nums">
          <span className="inline-flex items-center gap-1"><Clock className="size-3" />{blog.readMinutes}m</span>
          <span className="inline-flex items-center gap-1"><Eye className="size-3" />{blog.views}</span>
          <span className={cn('inline-flex items-center gap-1', blog.liked && 'text-bad')}>
            <Heart className={cn('size-3', blog.liked && 'fill-current')} />{blog.likes}
          </span>
        </span>
      </div>
    </Link>
  );
}
