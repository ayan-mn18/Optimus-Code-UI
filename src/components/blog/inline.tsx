import { Fragment, type ReactNode } from 'react';

/**
 * A deliberately small inline formatter: `code`, **bold**, *italic* and
 * [text](url). Authors and the research pipeline both write these four, and
 * nothing here ever reaches `dangerouslySetInnerHTML` — every match becomes a
 * React element, so a link in a submitted blog cannot inject markup.
 */
const TOKEN = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(\[[^\]]+\]\([^)\s]+\))/g;

/** Anything that is not http(s) is dropped rather than rendered as a link. */
function safeHref(url: string) {
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function inlineText(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN)) {
    const token = match[0];
    const at = match.index ?? 0;
    if (at > cursor) nodes.push(text.slice(cursor, at));
    cursor = at + token.length;

    if (token.startsWith('`')) {
      nodes.push(
        <code key={key++} className="rounded-[5px] border border-line bg-elevated/80 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-pale">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**')) {
      // Recurse so `code` and links keep working inside bold and italic runs.
      nodes.push(<strong key={key++} className="font-semibold text-ink">{inlineText(token.slice(2, -2))}</strong>);
    } else if (token.startsWith('[')) {
      const split = token.indexOf('](');
      const label = token.slice(1, split);
      const href = safeHref(token.slice(split + 2, -1));
      nodes.push(href
        ? <a key={key++} href={href} target="_blank" rel="noreferrer noopener" className="text-brand-pale underline decoration-brand/40 underline-offset-2 hover:decoration-brand">{label}</a>
        : <Fragment key={key++}>{label}</Fragment>);
    } else {
      nodes.push(<em key={key++} className="italic text-ink-muted">{inlineText(token.slice(1, -1))}</em>);
    }
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length ? nodes : text;
}

/** Stable anchor for a heading, shared by the table of contents. */
export const headingId = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
