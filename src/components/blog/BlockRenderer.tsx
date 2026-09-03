import { lazy, Suspense, type ReactNode } from 'react';
import { AlertTriangle, Info, Lightbulb, MessageSquareQuote, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BlogBlock, CalloutTone } from '@/lib/types';
import { headingId, inlineText } from './inline';
import { CodeBlock } from './CodeBlock';
import { Mermaid } from './Mermaid';

const FileSystemTrie = lazy(() =>
  import('./widgets/FileSystemTrie').then((module) => ({ default: module.FileSystemTrie })));

/** Widgets an article may embed by name. Unknown names render nothing. */
const WIDGETS: Record<string, ReactNode> = {
  'file-system-trie': <FileSystemTrie />,
};

const CALLOUTS: Record<CalloutTone, { icon: typeof Info; className: string; label: string }> = {
  info: { icon: Info, className: 'border-brand/30 bg-brand/8 text-brand-pale', label: 'Note' },
  tip: { icon: Lightbulb, className: 'border-good/30 bg-good/8 text-good', label: 'Tip' },
  warn: { icon: AlertTriangle, className: 'border-warn/30 bg-warn/8 text-warn', label: 'Careful' },
  gotcha: { icon: ShieldAlert, className: 'border-bad/30 bg-bad/8 text-bad', label: 'Gotcha' },
  interview: { icon: MessageSquareQuote, className: 'border-accent/30 bg-accent/8 text-accent', label: 'In the interview' },
};

export function BlockRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="blog-body">
      {blocks.map((block, index) => <Block key={index} block={block} />)}
    </div>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case 'heading': {
      const { level, text } = block as Extract<BlogBlock, { type: 'heading' }>;
      const id = headingId(text);
      return level === 3
        ? <h3 id={id} className="mt-8 scroll-mt-24 text-lg font-semibold tracking-tight text-ink">{inlineText(text)}</h3>
        : (
          <h2 id={id} className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-ink first:mt-0">
            {inlineText(text)}
            <span className="mt-3 block h-px rule-fade" />
          </h2>
        );
    }

    case 'paragraph':
      return <p className="mt-4 leading-[1.75] text-ink-muted">{inlineText((block as { text: string }).text)}</p>;

    case 'list': {
      const { ordered, items } = block as Extract<BlogBlock, { type: 'list' }>;
      const List = ordered ? 'ol' : 'ul';
      return (
        <List className={cn('mt-4 space-y-2 pl-1', ordered ? 'list-decimal pl-5' : '')}>
          {items.map((item, index) => (
            <li key={index} className={cn('leading-[1.7] text-ink-muted', !ordered && 'flex gap-3')}>
              {!ordered && <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand/70" />}
              <span className="min-w-0 flex-1">{inlineText(item)}</span>
            </li>
          ))}
        </List>
      );
    }

    case 'callout': {
      const { tone, title, text } = block as Extract<BlogBlock, { type: 'callout' }>;
      const style = CALLOUTS[tone] ?? CALLOUTS.info;
      const Icon = style.icon;
      return (
        <aside className={cn('my-6 rounded-2xl border px-4 py-3.5', style.className)}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
            <Icon className="size-3.5 shrink-0" />
            {title ? inlineText(title) : style.label}
          </p>
          <p className="mt-2 text-sm leading-[1.7] text-ink-muted">{inlineText(text)}</p>
        </aside>
      );
    }

    case 'code': {
      const { code, language, filename } = block as Extract<BlogBlock, { type: 'code' }>;
      return <CodeBlock code={code} language={language} filename={filename} />;
    }

    case 'mermaid': {
      const { code, title, caption } = block as Extract<BlogBlock, { type: 'mermaid' }>;
      return <Mermaid code={code} title={title} caption={caption} />;
    }

    case 'table': {
      const { headers, rows, caption } = block as Extract<BlogBlock, { type: 'table' }>;
      return (
        <figure className="my-6 overflow-hidden rounded-2xl border border-line">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-elevated/60">
                  {headers.map((header, index) => (
                    <th key={index} scope="col" className="border-b border-line px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
                      {inlineText(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-line/70 last:border-0 hover:bg-elevated/30">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={cn('px-4 py-2.5 align-top leading-relaxed', cellIndex === 0 ? 'text-ink' : 'text-ink-muted')}>
                        {inlineText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {caption && <figcaption className="border-t border-line bg-surface/40 px-4 py-2.5 text-xs text-ink-dim">{inlineText(caption)}</figcaption>}
        </figure>
      );
    }

    case 'steps': {
      const { items } = block as Extract<BlogBlock, { type: 'steps' }>;
      return (
        <ol className="my-6 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3.5 rounded-2xl border border-line bg-card/50 p-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-brand/25 bg-brand/10 text-xs font-semibold text-brand-pale">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{inlineText(item.title)}</p>
                <p className="mt-1.5 text-sm leading-[1.7] text-ink-muted">{inlineText(item.text)}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    }

    case 'quote': {
      const { text, cite } = block as Extract<BlogBlock, { type: 'quote' }>;
      return (
        <blockquote className="my-6 border-l-2 border-brand/50 pl-4">
          <p className="text-[15px] italic leading-[1.7] text-ink-muted">{inlineText(text)}</p>
          {cite && <cite className="mt-2 block text-xs not-italic text-ink-dim">— {cite}</cite>}
        </blockquote>
      );
    }

    case 'widget': {
      const { name, title, caption } = block as Extract<BlogBlock, { type: 'widget' }>;
      const widget = WIDGETS[name];
      if (!widget) return null;
      return (
        <section>
          {title && <p className="mt-8 text-[11px] uppercase tracking-wider text-ink-dim">{title}</p>}
          <Suspense fallback={<div className="skeleton my-6 h-64 w-full rounded-2xl" />}>{widget}</Suspense>
          {caption && <p className="-mt-3 text-xs leading-relaxed text-ink-dim">{inlineText(caption)}</p>}
        </section>
      );
    }

    case 'divider':
      return <hr className="my-10 h-px border-0 rule-fade" />;

    // A block type the pipeline emitted before the reader learned to draw it.
    default:
      return null;
  }
}
