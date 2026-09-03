import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { inlineText } from './inline';

let ready: Promise<typeof import('mermaid').default> | null = null;

/**
 * Mermaid is ~500KB, so it is imported on first use rather than in the app
 * bundle. `securityLevel: 'strict'` is what makes it safe to render diagrams
 * that came from a reader-submitted blog: scripts and click bindings in the
 * source are stripped before the SVG is produced.
 */
function loadMermaid() {
  ready ??= import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: "'Inter var', ui-sans-serif, system-ui, sans-serif",
      themeVariables: {
        background: '#131318',
        primaryColor: '#1f1b3a',
        primaryTextColor: '#f2f2f7',
        primaryBorderColor: '#7c5cff',
        secondaryColor: '#1a1a22',
        tertiaryColor: '#12222b',
        lineColor: '#6e6e80',
        textColor: '#d7d7e0',
        mainBkg: '#1a1a22',
        nodeBorder: '#4a3fa8',
        clusterBkg: '#101017',
        clusterBorder: '#24242e',
        edgeLabelBackground: '#131318',
        fontSize: '14px',
      },
    });
    return mermaid;
  });
  return ready;
}

let sequence = 0;

export function Mermaid({ code, title, caption }: { code: string; title?: string; caption?: string }) {
  const [svg, setSvg] = useState('');
  const [failed, setFailed] = useState(false);
  const id = useRef(`mermaid-${(sequence += 1)}`);

  useEffect(() => {
    let live = true;
    setFailed(false);
    loadMermaid()
      .then((mermaid) => mermaid.render(id.current, code))
      .then((result) => live && setSvg(result.svg))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [code]);

  if (failed) {
    return (
      <figure className="my-6 rounded-2xl border border-warn/30 bg-warn/5 p-4">
        <p className="flex items-center gap-2 text-xs text-warn">
          <AlertTriangle className="size-3.5" /> This diagram could not be drawn — showing its source.
        </p>
        <pre className="mt-3 overflow-x-auto font-mono text-[12px] text-ink-muted">{code}</pre>
      </figure>
    );
  }

  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-line bg-card/60">
      {title && (
        <figcaption className="border-b border-line px-4 py-2 text-[11px] uppercase tracking-wider text-ink-dim">
          {title}
        </figcaption>
      )}
      <div className="overflow-x-auto px-4 py-6">
        {svg
          ? <div className="mermaid-diagram flex min-w-fit justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
          : <div className="skeleton h-40 w-full" />}
      </div>
      {caption && <p className="border-t border-line px-4 py-2.5 text-xs leading-relaxed text-ink-dim">{inlineText(caption)}</p>}
    </figure>
  );
}
