import type { BlogBlock, CalloutTone } from './types';

/**
 * Markdown ⇄ blocks.
 *
 * Blocks are the canonical storage format — the reader draws diagrams and
 * widgets from them, and the research pipeline emits them directly. Humans do
 * not want to hand-write JSON, so the editor works in a small markdown dialect
 * and converts on save. The round trip is lossless for every block type below.
 *
 *   ## / ###                  heading
 *   - item / 1. item          list
 *   > [!tip] Title            callout   (info · tip · warn · gotcha · interview)
 *   ```java Main.java         code      (info string: language, then filename)
 *   ```mermaid Diagram title  mermaid
 *   ```steps                  steps     (one "Title :: body" per line)
 *   ```widget file-system-trie  widget
 *   | a | b |                 table
 *   ---                       divider
 */

const TONES: Record<string, CalloutTone> = {
  note: 'info',
  info: 'info',
  tip: 'tip',
  warning: 'warn',
  warn: 'warn',
  caution: 'gotcha',
  gotcha: 'gotcha',
  interview: 'interview',
};

const isTableRow = (line: string) => line.trim().startsWith('|') && line.trim().endsWith('|');
const cells = (line: string) => line.trim().slice(1, -1).split('|').map((cell) => cell.trim());

export function parseBlocks(markdown: string): BlogBlock[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: BlogBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'divider' });
      index += 1;
      continue;
    }

    const heading = trimmed.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length === 3 ? 3 : 2, text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const [language = 'text', ...rest] = trimmed.slice(3).trim().split(/\s+/);
      const meta = rest.join(' ');
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1; // closing fence
      const code = body.join('\n');

      if (language === 'mermaid') {
        const [title, caption] = meta.split('||').map((part) => part.trim());
        blocks.push({ type: 'mermaid', code, ...(title ? { title } : {}), ...(caption ? { caption } : {}) });
      } else if (language === 'steps') {
        blocks.push({
          type: 'steps',
          items: body
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => {
              const [title, ...text] = entry.split('::');
              return { title: title.trim(), text: text.join('::').trim() };
            }),
        });
      } else if (language === 'widget') {
        const [title, caption] = meta.split('||').map((part) => part.trim());
        blocks.push({
          type: 'widget',
          name: (code.trim() || title || '').split(/\s+/)[0],
          ...(code.trim() && title ? { title } : {}),
          ...(caption ? { caption } : {}),
        });
      } else {
        blocks.push({ type: 'code', language, code, ...(meta ? { filename: meta } : {}) });
      }
      continue;
    }

    if (trimmed.startsWith('>')) {
      const body: string[] = [];
      let tone: CalloutTone | null = null;
      let title: string | undefined;

      while (index < lines.length && lines[index].trim().startsWith('>')) {
        const content = lines[index].trim().replace(/^>\s?/, '');
        const marker = content.match(/^\[!(\w+)\]\s*(.*)$/);
        if (marker) {
          tone = TONES[marker[1].toLowerCase()] ?? 'info';
          title = marker[2].trim() || undefined;
        } else if (content) {
          body.push(content);
        }
        index += 1;
      }

      if (tone) blocks.push({ type: 'callout', tone, ...(title ? { title } : {}), text: body.join(' ') });
      else blocks.push({ type: 'quote', text: body.join(' ') });
      continue;
    }

    if (isTableRow(trimmed) && isTableRow(lines[index + 1]?.trim() ?? '') && /^[-:|\s]+$/.test(lines[index + 1])) {
      const headers = cells(trimmed);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && isTableRow(lines[index].trim())) {
        rows.push(cells(lines[index]));
        index += 1;
      }
      // A trailing "^ caption" line documents the table without a fence.
      let caption: string | undefined;
      if (lines[index]?.trim().startsWith('^')) {
        caption = lines[index].trim().slice(1).trim();
        index += 1;
      }
      blocks.push({ type: 'table', headers, rows, ...(caption ? { caption } : {}) });
      continue;
    }

    const bullet = trimmed.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (bullet) {
      const ordered = /^\d+\./.test(bullet[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const entry = lines[index].trim().match(/^([-*]|\d+\.)\s+(.*)$/);
        if (!entry || /^\d+\./.test(entry[1]) !== ordered) break;
        items.push(entry[2].trim());
        index += 1;
      }
      blocks.push({ type: 'list', ...(ordered ? { ordered: true } : {}), items });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim() && !/^(#{2,3}\s|```|>|[-*]\s|\d+\.\s|\||---$)/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
    else index += 1;
  }

  return blocks;
}

export function serializeBlocks(blocks: BlogBlock[]): string {
  const chunks = blocks.map((block) => {
    switch (block.type) {
      case 'heading': {
        const { level, text } = block as Extract<BlogBlock, { type: 'heading' }>;
        return `${'#'.repeat(level)} ${text}`;
      }
      case 'paragraph':
        return (block as { text: string }).text;
      case 'list': {
        const { ordered, items } = block as Extract<BlogBlock, { type: 'list' }>;
        return items.map((item, index) => `${ordered ? `${index + 1}.` : '-'} ${item}`).join('\n');
      }
      case 'callout': {
        const { tone, title, text } = block as Extract<BlogBlock, { type: 'callout' }>;
        return `> [!${tone}] ${title ?? ''}`.trimEnd() + `\n> ${text}`;
      }
      case 'quote':
        return `> ${(block as { text: string }).text}`;
      case 'code': {
        const { language, filename, code } = block as Extract<BlogBlock, { type: 'code' }>;
        return `\`\`\`${language}${filename ? ` ${filename}` : ''}\n${code}\n\`\`\``;
      }
      case 'mermaid': {
        const { title, caption, code } = block as Extract<BlogBlock, { type: 'mermaid' }>;
        const meta = [title, caption].filter(Boolean).join(' || ');
        return `\`\`\`mermaid${meta ? ` ${meta}` : ''}\n${code}\n\`\`\``;
      }
      case 'steps': {
        const { items } = block as Extract<BlogBlock, { type: 'steps' }>;
        return `\`\`\`steps\n${items.map((item) => `${item.title} :: ${item.text}`).join('\n')}\n\`\`\``;
      }
      case 'widget': {
        const { name, title, caption } = block as Extract<BlogBlock, { type: 'widget' }>;
        const meta = [title, caption].filter(Boolean).join(' || ');
        return `\`\`\`widget${meta ? ` ${meta}` : ''}\n${name}\n\`\`\``;
      }
      case 'table': {
        const { headers, rows, caption } = block as Extract<BlogBlock, { type: 'table' }>;
        const row = (values: string[]) => `| ${values.join(' | ')} |`;
        return [
          row(headers),
          `| ${headers.map(() => '---').join(' | ')} |`,
          ...rows.map(row),
          ...(caption ? [`^ ${caption}`] : []),
        ].join('\n');
      }
      case 'divider':
        return '---';
      default:
        return '';
    }
  });

  return chunks.filter(Boolean).join('\n\n');
}
