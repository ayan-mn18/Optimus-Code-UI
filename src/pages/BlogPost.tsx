import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Heart, Pencil, Sparkles } from 'lucide-react';
import { Button, Card, Chip, DifficultyBadge, EmptyState, Skeleton } from '@/components/ui/primitives';
import { BlockRenderer } from '@/components/blog/BlockRenderer';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { AskedInCompanies } from '@/components/blog/AskedInCompanies';
import { ReferenceList } from '@/components/blog/ReferenceList';
import { BlogCard } from '@/components/blog/BlogCard';
import { useBlog, useToggleBlogLike } from '@/hooks/useBlogs';
import { cn, formatDate } from '@/lib/utils';

const ORIGIN_LABEL = {
  editorial: 'Optimus editorial',
  pipeline: 'Researched from public sources',
  user: 'Community write-up',
} as const;

export function BlogPost() {
  const { slug } = useParams();
  const query = useBlog(slug);
  const like = useToggleBlogLike();

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <EmptyState
        icon={<Sparkles className="size-6" />}
        title="This write-up is not available"
        body={query.error?.message ?? 'It may have been unpublished or removed.'}
      />
    );
  }

  const { blog, related } = query.data;

  return (
    <div className="mx-auto w-full max-w-[70rem]">
      <Link to="/blogs" className="inline-flex items-center gap-1.5 text-xs text-ink-dim hover:text-ink">
        <ArrowLeft className="size-3.5" /> All blogs
      </Link>

      <div className="mt-4 grid gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-1.5">
              <Chip className="border-brand/25 bg-brand/10 text-brand-pale">{blog.kind}</Chip>
              {blog.difficulty && <DifficultyBadge difficulty={blog.difficulty} />}
              {blog.topic && <Chip>{blog.topic}</Chip>}
              {blog.status === 'draft' && <Chip className="border-warn/30 text-warn">Draft — only you can see this</Chip>}
            </div>

            <h1 className="mt-3 flex items-start gap-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              <span aria-hidden className="shrink-0">{blog.coverEmoji}</span>
              <span>{blog.title}</span>
            </h1>

            {blog.summary && <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{blog.summary}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3 text-xs text-ink-dim">
              <span className="text-ink-muted">{blog.author.name}</span>
              <span className="rounded border border-line px-1.5 py-px text-[10px]">{ORIGIN_LABEL[blog.origin]}</span>
              {blog.publishedAt && <span>{formatDate(blog.publishedAt.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              <span className="inline-flex items-center gap-1"><Clock className="size-3" />{blog.readMinutes} min read</span>
              <span className="inline-flex items-center gap-1 tabular-nums"><Eye className="size-3" />{blog.views}</span>
              <div className="ml-auto flex items-center gap-2">
                {blog.isAuthor && (
                  <Link to={`/blogs/${blog.slug}/edit`}>
                    <Button size="sm" variant="outline" icon={<Pencil className="size-3.5" />}>Edit</Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant={blog.liked ? 'primary' : 'outline'}
                  onClick={() => like.mutate({ id: blog.id, slug: blog.slug })}
                  icon={<Heart className={cn('size-3.5', blog.liked && 'fill-current')} />}
                >
                  <span className="tabular-nums">{blog.likes}</span>
                </Button>
              </div>
            </div>

            {blog.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {blog.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}
              </div>
            )}
          </header>

          <div className="mt-8">
            <BlockRenderer blocks={blog.blocks} />
          </div>

          <div className="mt-12 space-y-4">
            <AskedInCompanies companies={blog.companies} evidence={blog.evidence} />
            <ReferenceList refs={blog.refs} />
          </div>

          {blog.problemId && (
            <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-ink">Ready to be graded on it?</p>
                <p className="mt-0.5 text-xs text-ink-dim">Take the Optimus assessment for this problem.</p>
              </div>
              <Link to={`/system-design/${blog.kind === 'HLD' ? 'hld' : 'lld'}`}>
                <Button size="sm" icon={<Sparkles className="size-3.5" />}>Open in catalogue</Button>
              </Link>
            </Card>
          )}

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-sm font-semibold text-ink">More {blog.kind} write-ups</h2>
              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {related.map((entry) => <BlogCard key={entry.id} blog={entry} />)}
              </div>
            </section>
          )}
        </article>

        <TableOfContents blocks={blog.blocks} />
      </div>
    </div>
  );
}
