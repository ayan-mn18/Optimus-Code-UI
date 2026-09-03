import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { BlogBlock } from '@/lib/types';
import { headingId } from './inline';

/**
 * Reading position, derived from the headings that are currently on screen.
 * The topmost visible heading wins so the rail never flickers between two
 * sections that are both intersecting.
 */
export function TableOfContents({ blocks }: { blocks: BlogBlock[] }) {
  const headings = blocks
    .filter((block): block is Extract<BlogBlock, { type: 'heading' }> => block.type === 'heading')
    .map((block) => ({ id: headingId(block.text), text: block.text, level: block.level }));

  const [active, setActive] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
    // Headings are derived from blocks and stable for the life of the article.
  }, [blocks]);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="On this page" className="sticky top-8 hidden max-h-[calc(100dvh-6rem)] overflow-y-auto xl:block">
      <p className="mb-3 text-[10px] uppercase tracking-wider text-ink-dim">On this page</p>
      <ul className="space-y-0.5 border-l border-line">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                '-ml-px block border-l py-1.5 pl-3 text-[12px] leading-snug transition-colors',
                heading.level === 3 && 'pl-6',
                heading.id === active
                  ? 'border-brand text-brand-pale'
                  : 'border-transparent text-ink-dim hover:border-line-strong hover:text-ink-muted',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
