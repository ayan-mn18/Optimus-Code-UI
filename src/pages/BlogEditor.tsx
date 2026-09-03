import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, HelpCircle, Plus, Save, Send, Trash2, X } from 'lucide-react';
import { Button, Card, CardHeader, Chip, EmptyState, Field, Skeleton } from '@/components/ui/primitives';
import { BlockRenderer } from '@/components/blog/BlockRenderer';
import { useBlog, useCreateBlog, useDeleteBlog, useUpdateBlog } from '@/hooks/useBlogs';
import { parseBlocks, serializeBlocks } from '@/lib/blog-markdown';
import { cn } from '@/lib/utils';
import type { BlogKind, BlogRef, CompanyTag, Difficulty } from '@/lib/types';

const KINDS: BlogKind[] = ['LLD', 'HLD', 'DSA', 'General'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const REF_KINDS: BlogRef['kind'][] = ['problem', 'article', 'discussion', 'video', 'repo', 'other'];

const STARTER = `## The problem

State it in one paragraph, the way you would to a colleague.

> [!info] What you are actually being asked
> The one sentence that reframes the question.

## Approach

- First idea, and why it is not enough
- The idea that works

\`\`\`java Solution.java
class Solution {
    // ...
}
\`\`\`

\`\`\`mermaid How the pieces fit || Read this left to right.
flowchart LR
    A[Client] --> B[Service] --> C[(Store)]
\`\`\`

| Operation | Naive | Final |
| --- | --- | --- |
| lookup | O(n) | O(1) |
^ Costs after the rewrite.
`;

const CHEATSHEET = [
  ['## / ###', 'Section heading'],
  ['- item · 1. item', 'Bullet or numbered list'],
  ['> [!tip] Title', 'Callout — info, tip, warn, gotcha, interview'],
  ['```java File.java', 'Code block with a filename'],
  ['```mermaid Title || Caption', 'Diagram — flowchart, classDiagram, sequenceDiagram'],
  ['```steps', 'One "Title :: body" per line'],
  ['```widget', 'Embed a widget by name, e.g. file-system-trie'],
  ['| a | b |', 'Table; a trailing "^ text" line is its caption'],
  ['**bold** *italic* `code` [text](url)', 'Inline formatting'],
];

export function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(slug);
  const existing = useBlog(slug);

  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [kind, setKind] = useState<BlogKind>('LLD');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [coverEmoji, setCoverEmoji] = useState('📘');
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [companies, setCompanies] = useState<CompanyTag[]>([]);
  const [refs, setRefs] = useState<BlogRef[]>([]);
  const [markdown, setMarkdown] = useState(STARTER);
  const [preview, setPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const blog = existing.data?.blog;

  useEffect(() => {
    if (!editing || !blog || loaded) return;
    setTitle(blog.title);
    setSummary(blog.summary);
    setKind(blog.kind);
    setTopic(blog.topic ?? '');
    setDifficulty(blog.difficulty ?? '');
    setCoverEmoji(blog.coverEmoji);
    setTags(blog.tags);
    setCompanies(blog.companies);
    setRefs(blog.refs);
    setMarkdown(serializeBlocks(blog.blocks));
    setLoaded(true);
  }, [blog, editing, loaded]);

  const blocks = useMemo(() => parseBlocks(markdown), [markdown]);
  const pending = createBlog.isPending || updateBlog.isPending;
  const error = createBlog.error ?? updateBlog.error ?? deleteBlog.error;

  const draft = () => ({
    title: title.trim(),
    summary: summary.trim() || undefined,
    kind,
    topic: topic.trim() || undefined,
    difficulty: difficulty || null,
    coverEmoji,
    blocks,
    tags,
    companies: companies.filter((company) => company.name.trim()),
    refs: refs.filter((ref) => ref.title.trim() && ref.url.trim()),
  });

  const save = async (status: 'draft' | 'published') => {
    if (title.trim().length < 4) return;
    const payload = { ...draft(), status };
    const result = blog
      ? await updateBlog.mutateAsync({ id: blog.id, draft: payload })
      : await createBlog.mutateAsync(payload);
    navigate(status === 'published' ? `/blogs/${result.blog.slug}` : `/blogs/${result.blog.slug}/edit`, { replace: true });
  };

  const remove = async () => {
    if (!blog) return;
    await deleteBlog.mutateAsync(blog.id);
    navigate('/blogs', { replace: true });
  };

  const addTag = () => {
    const value = tagDraft.trim();
    if (value && !tags.includes(value)) setTags([...tags, value]);
    setTagDraft('');
  };

  if (editing && existing.isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (editing && blog && !blog.isAuthor) {
    return <EmptyState title="You cannot edit this write-up" body="It belongs to another author." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-dim">{editing ? 'Editing' : 'New blog'}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {editing ? blog?.title : 'Write a design write-up'}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
            Diagrams, code and tables come from a small markdown dialect — the preview shows exactly what readers get.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(!showHelp)} icon={<HelpCircle className="size-3.5" />}>
            Syntax
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreview(!preview)} icon={<Eye className="size-3.5" />}>
            {preview ? 'Edit' : 'Preview'}
          </Button>
          {blog && (
            <Button variant="danger" size="sm" onClick={remove} loading={deleteBlog.isPending} icon={<Trash2 className="size-3.5" />}>
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => save('draft')} loading={pending} icon={<Save className="size-3.5" />}>
            Save draft
          </Button>
          <Button size="sm" onClick={() => save('published')} loading={pending} icon={<Send className="size-3.5" />}>
            Publish
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">{error.message}</p>
      )}

      {showHelp && (
        <Card className="p-4">
          <CardHeader title="Markdown dialect" hint="Anything not listed here is a paragraph." />
          <ul className="grid gap-2 sm:grid-cols-2">
            {CHEATSHEET.map(([syntax, meaning]) => (
              <li key={syntax} className="flex flex-col gap-0.5 rounded-lg border border-line bg-surface/50 px-3 py-2">
                <code className="font-mono text-[12px] text-brand-pale">{syntax}</code>
                <span className="text-[11px] text-ink-dim">{meaning}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <Card className="space-y-4 p-4">
            <div className="flex gap-3">
              <label className="w-16 shrink-0">
                <span className="block text-xs font-medium text-ink-muted">Icon</span>
                <input
                  value={coverEmoji}
                  onChange={(event) => setCoverEmoji(event.target.value.slice(0, 4))}
                  aria-label="Cover emoji"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface/80 text-center text-xl focus:border-brand/70 focus:outline-none"
                />
              </label>
              <div className="min-w-0 flex-1">
                <Field
                  label="Title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Design File System"
                  hint={title.trim().length < 4 ? 'At least 4 characters.' : undefined}
                />
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="block text-xs font-medium text-ink-muted">Summary</span>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value.slice(0, 400))}
                rows={2}
                placeholder="One or two sentences shown on the card and above the article."
                className="w-full rounded-xl border border-line bg-surface/80 px-3.5 py-2.5 text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
              />
              <span className="block text-right text-[11px] text-ink-dim">{summary.length}/400</span>
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="block text-xs font-medium text-ink-muted">Track</span>
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as BlogKind)}
                  className="h-11 w-full rounded-xl border border-line bg-surface/80 px-3 text-sm"
                >
                  {KINDS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <Field label="Topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="LLD Interview Problems" />
              <label className="space-y-1.5">
                <span className="block text-xs font-medium text-ink-muted">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as Difficulty | '')}
                  className="h-11 w-full rounded-xl border border-line bg-surface/80 px-3 text-sm"
                >
                  <option value="">Unset</option>
                  {DIFFICULTIES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-ink-muted">Tags</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((tag) => (
                  <button key={tag} type="button" onClick={() => setTags(tags.filter((entry) => entry !== tag))}>
                    <Chip className="hover:border-bad/40 hover:text-bad">{tag} <X className="size-3" /></Chip>
                  </button>
                ))}
                <input
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder="Add a tag"
                  aria-label="Add a tag"
                  className="h-7 min-w-28 flex-1 rounded-md border border-dashed border-line bg-transparent px-2 text-xs placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="text-xs font-medium text-ink-muted">{preview ? 'Preview' : 'Content'}</span>
              <span className="text-[11px] text-ink-dim">{blocks.length} blocks</span>
            </div>
            {preview ? (
              <div className="px-5 py-5">
                {blocks.length
                  ? <BlockRenderer blocks={blocks} />
                  : <p className="text-sm text-ink-dim">Nothing to preview yet.</p>}
              </div>
            ) : (
              <textarea
                value={markdown}
                onChange={(event) => setMarkdown(event.target.value)}
                spellCheck={false}
                className={cn(
                  'min-h-[32rem] w-full resize-y bg-transparent px-4 py-4 font-mono text-[13px] leading-relaxed',
                  'placeholder:text-ink-dim focus:outline-none',
                )}
              />
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <CardHeader
              title="Asked in companies"
              hint="A source link turns a claim into evidence."
              action={
                <Button size="sm" variant="ghost" onClick={() => setCompanies([...companies, { name: '' }])} icon={<Plus className="size-3.5" />}>
                  Add
                </Button>
              }
            />
            <ul className="space-y-3">
              {companies.map((company, index) => (
                <li key={index} className="space-y-2 rounded-xl border border-line bg-surface/50 p-3">
                  <div className="flex gap-2">
                    <input
                      value={company.name}
                      onChange={(event) => setCompanies(companies.map((entry, i) => i === index ? { ...entry, name: event.target.value } : entry))}
                      placeholder="Company"
                      aria-label="Company name"
                      className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-surface/80 px-2.5 text-xs focus:border-brand/70 focus:outline-none"
                    />
                    <input
                      value={company.count ?? ''}
                      onChange={(event) => setCompanies(companies.map((entry, i) => i === index ? { ...entry, count: Number(event.target.value) || undefined } : entry))}
                      placeholder="×"
                      inputMode="numeric"
                      aria-label="Times reported"
                      className="h-8 w-12 rounded-lg border border-line bg-surface/80 px-2 text-center text-xs focus:border-brand/70 focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${company.name || 'company'}`}
                      onClick={() => setCompanies(companies.filter((_, i) => i !== index))}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-dim hover:bg-elevated hover:text-bad"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <input
                    value={company.roles?.join(', ') ?? ''}
                    onChange={(event) => setCompanies(companies.map((entry, i) => i === index
                      ? { ...entry, roles: event.target.value.split(',').map((role) => role.trim()).filter(Boolean) }
                      : entry))}
                    placeholder="Roles, comma separated"
                    aria-label="Roles"
                    className="h-8 w-full rounded-lg border border-line bg-surface/80 px-2.5 text-xs focus:border-brand/70 focus:outline-none"
                  />
                  <input
                    value={company.sources?.[0] ?? ''}
                    onChange={(event) => setCompanies(companies.map((entry, i) => i === index
                      ? { ...entry, sources: event.target.value.trim() ? [event.target.value.trim()] : [] }
                      : entry))}
                    placeholder="https://source-of-the-claim"
                    aria-label="Source link"
                    className="h-8 w-full rounded-lg border border-line bg-surface/80 px-2.5 font-mono text-[11px] focus:border-brand/70 focus:outline-none"
                  />
                </li>
              ))}
              {!companies.length && <li className="text-xs text-ink-dim">No company tags yet.</li>}
            </ul>
          </Card>

          <Card className="p-4">
            <CardHeader
              title="References"
              hint="Every source the write-up leans on."
              action={
                <Button size="sm" variant="ghost" onClick={() => setRefs([...refs, { title: '', url: '', kind: 'article' }])} icon={<Plus className="size-3.5" />}>
                  Add
                </Button>
              }
            />
            <ul className="space-y-3">
              {refs.map((ref, index) => (
                <li key={index} className="space-y-2 rounded-xl border border-line bg-surface/50 p-3">
                  <div className="flex gap-2">
                    <input
                      value={ref.title}
                      onChange={(event) => setRefs(refs.map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry))}
                      placeholder="Title"
                      aria-label="Reference title"
                      className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-surface/80 px-2.5 text-xs focus:border-brand/70 focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${ref.title || 'reference'}`}
                      onClick={() => setRefs(refs.filter((_, i) => i !== index))}
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-dim hover:bg-elevated hover:text-bad"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <input
                    value={ref.url}
                    onChange={(event) => setRefs(refs.map((entry, i) => i === index ? { ...entry, url: event.target.value } : entry))}
                    placeholder="https://…"
                    aria-label="Reference url"
                    className="h-8 w-full rounded-lg border border-line bg-surface/80 px-2.5 font-mono text-[11px] focus:border-brand/70 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      value={ref.source ?? ''}
                      onChange={(event) => setRefs(refs.map((entry, i) => i === index ? { ...entry, source: event.target.value } : entry))}
                      placeholder="LeetCode"
                      aria-label="Reference source"
                      className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-surface/80 px-2.5 text-xs focus:border-brand/70 focus:outline-none"
                    />
                    <select
                      value={ref.kind}
                      onChange={(event) => setRefs(refs.map((entry, i) => i === index ? { ...entry, kind: event.target.value as BlogRef['kind'] } : entry))}
                      aria-label="Reference kind"
                      className="h-8 rounded-lg border border-line bg-surface/80 px-2 text-xs"
                    >
                      {REF_KINDS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </div>
                </li>
              ))}
              {!refs.length && <li className="text-xs text-ink-dim">No references yet.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
