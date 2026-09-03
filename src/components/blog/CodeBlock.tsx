import { useState } from 'react';
import { Highlight, type PrismTheme } from 'prism-react-renderer';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Prism theme built from the app's own tokens so code sits inside the page. */
const theme: PrismTheme = {
  plain: { color: '#e7e7f0', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#6e6e80', fontStyle: 'italic' } },
    { types: ['punctuation', 'operator'], style: { color: '#a1a1b0' } },
    { types: ['string', 'char', 'attr-value', 'inserted'], style: { color: '#34d399' } },
    { types: ['number', 'boolean', 'constant', 'symbol'], style: { color: '#fab219' } },
    { types: ['keyword', 'atrule', 'important'], style: { color: '#c4b5fd' } },
    { types: ['function', 'class-name', 'builtin'], style: { color: '#22d3ee' } },
    { types: ['variable', 'attr-name', 'property'], style: { color: '#8b7bff' } },
    { types: ['deleted'], style: { color: '#f4696b' } },
  ],
};

export function CodeBlock({ code, language, filename }: { code: string; language: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-line bg-[#0c0c11]">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-surface/60 px-4 py-2">
        <span className="truncate font-mono text-[11px] text-ink-dim">{filename ?? language}</span>
        <button
          type="button"
          onClick={copy}
          className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors',
            copied ? 'text-good' : 'text-ink-dim hover:bg-elevated hover:text-ink')}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <Highlight code={code.trimEnd()} language={language} theme={theme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
            {tokens.map((line, index) => (
              <div key={index} {...getLineProps({ line })} className="table-row">
                <span className="table-cell select-none pr-4 text-right text-[11px] text-ink-dim/60 tabular-nums">
                  {index + 1}
                </span>
                <span className="table-cell">
                  {line.map((token, tokenIndex) => <span key={tokenIndex} {...getTokenProps({ token })} />)}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </figure>
  );
}
