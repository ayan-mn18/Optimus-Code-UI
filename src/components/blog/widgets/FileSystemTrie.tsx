import { useReducer, useState } from 'react';
import { CornerDownRight, Play, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/* The algorithm from the article, verbatim — the widget and the code listing   */
/* must never disagree.                                                         */
/* -------------------------------------------------------------------------- */

interface Node {
  name: string;
  value: number;
  hasValue: boolean;
  children: Map<string, Node>;
}

const node = (name: string): Node => ({ name, value: 0, hasValue: false, children: new Map() });

/** null for any path that is not "/name(/name)*". */
function segments(path: string): string[] | null {
  if (!path || path.length < 2 || path[0] !== '/') return null;
  const parts = path.slice(1).split('/');
  return parts.some((part) => !part) ? null : parts;
}

function createPath(root: Node, path: string, value: number) {
  const parts = segments(path);
  if (!parts) return { ok: false, reason: 'invalid path' };

  let current = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const next = current.children.get(parts[i]);
    if (!next) return { ok: false, reason: `/${parts.slice(0, i + 1).join('/')} does not exist` };
    current = next;
  }

  const leaf = parts[parts.length - 1];
  const existing = current.children.get(leaf);
  if (existing?.hasValue) return { ok: false, reason: 'path already exists' };

  const target = existing ?? node(leaf);
  target.value = value;
  target.hasValue = true;
  current.children.set(leaf, target);
  return { ok: true, reason: 'created' };
}

function walk(root: Node, path: string): Node | null {
  const parts = segments(path);
  if (!parts) return null;
  let current: Node | undefined = root;
  for (const part of parts) {
    current = current?.children.get(part);
    if (!current) return null;
  }
  return current;
}

function removePath(root: Node, path: string) {
  const parts = segments(path);
  if (!parts) return false;
  let current = root;
  for (const part of parts.slice(0, -1)) {
    const next = current.children.get(part);
    if (!next) return false;
    current = next;
  }
  return current.children.delete(parts[parts.length - 1]);
}

/* -------------------------------------------------------------------------- */
/* Widget                                                                      */
/* -------------------------------------------------------------------------- */

interface LogEntry {
  call: string;
  result: string;
  ok: boolean;
}

const SCRIPT: { path: string; value: number }[] = [
  { path: '/leetcode', value: 1 },
  { path: '/leetcode/problems', value: 2 },
  { path: '/leetcode/contest', value: 3 },
  { path: '/usr', value: 9 },
];

function initialTree() {
  const root = node('/');
  for (const step of SCRIPT) createPath(root, step.path, step.value);
  return root;
}

export function FileSystemTrie() {
  const [root, setRoot] = useState(initialTree);
  const [, redraw] = useReducer((count: number) => count + 1, 0);
  const [path, setPath] = useState('/leetcode/solutions');
  const [value, setValue] = useState('7');
  const [touched, setTouched] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([
    { call: 'createPath("/leetcode", 1)', result: 'true', ok: true },
    { call: 'createPath("/leetcode/problems", 2)', result: 'true', ok: true },
    { call: 'createPath("/leetcode/contest", 3)', result: 'true', ok: true },
    { call: 'createPath("/usr", 9)', result: 'true', ok: true },
  ]);

  const push = (entry: LogEntry) => setLog((current) => [...current.slice(-11), entry]);

  const runCreate = () => {
    const parsed = Number.parseInt(value, 10);
    const result = createPath(root, path, Number.isNaN(parsed) ? 0 : parsed);
    push({
      call: `createPath("${path}", ${Number.isNaN(parsed) ? 0 : parsed})`,
      result: result.ok ? 'true' : `false — ${result.reason}`,
      ok: result.ok,
    });
    setTouched(result.ok ? path : null);
    redraw();
  };

  const runGet = () => {
    const found = walk(root, path);
    const result = found?.hasValue ? found.value : -1;
    push({ call: `get("${path}")`, result: String(result), ok: result !== -1 });
    setTouched(result !== -1 ? path : null);
  };

  const runDelete = () => {
    const removed = removePath(root, path);
    push({ call: `delete("${path}")`, result: String(removed), ok: removed });
    setTouched(null);
    redraw();
  };

  const reset = () => {
    setRoot(initialTree());
    setTouched(null);
    setLog([{ call: 'new FileSystem()', result: 'reset to the diagram above', ok: true }]);
  };

  return (
    <div className="my-6 grid gap-4 rounded-2xl border border-line bg-card/60 p-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <label className="min-w-40 flex-1">
            <span className="sr-only">Path</span>
            <input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && runCreate()}
              placeholder="/a/b"
              spellCheck={false}
              className="h-9 w-full rounded-lg border border-line bg-surface/80 px-3 font-mono text-sm placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
            />
          </label>
          <label className="w-24">
            <span className="sr-only">Value</span>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode="numeric"
              className="h-9 w-full rounded-lg border border-line bg-surface/80 px-3 font-mono text-sm focus:border-brand/70 focus:outline-none"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={runCreate} icon={<Play className="size-3.5" />}>createPath</Button>
          <Button size="sm" variant="outline" onClick={runGet} icon={<CornerDownRight className="size-3.5" />}>get</Button>
          <Button size="sm" variant="outline" onClick={runDelete} icon={<Trash2 className="size-3.5" />}>delete</Button>
          <Button size="sm" variant="ghost" onClick={reset} icon={<RotateCcw className="size-3.5" />}>Reset</Button>
        </div>

        <div className="rounded-xl border border-line bg-[#0c0c11] p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-ink-dim">Trie</p>
          <p className="font-mono text-[13px] text-ink-dim">/ <span className="text-[11px] italic">root</span></p>
          <TreeView node={root} prefix="" touched={touched} />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-[#0c0c11] p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-ink-dim">Call log</p>
        <ol className="space-y-1.5 font-mono text-[12px]">
          {log.map((entry, index) => (
            <li key={index} className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-ink-muted">{entry.call}</span>
              <span className={cn('text-[11px]', entry.ok ? 'text-good' : 'text-bad')}>→ {entry.result}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function TreeView({ node: current, prefix, touched }: { node: Node; prefix: string; touched: string | null }) {
  // The trie is mutated in place, so children are re-read on every render.
  const children = [...current.children.values()].sort((a, b) => a.name.localeCompare(b.name));
  if (!children.length) return null;

  return (
    <ul className="ml-2 space-y-1 border-l border-line pl-3">
      {children.map((child) => {
        const childPath = `${prefix}/${child.name}`;
        return (
          <li key={childPath}>
            <span
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-1.5 py-0.5 font-mono text-[13px]',
                childPath === touched && 'bg-brand/15 ring-1 ring-brand/40',
              )}
            >
              <span className={child.hasValue ? 'text-ink' : 'italic text-ink-dim'}>{child.name}</span>
              {child.hasValue
                ? <span className="text-[11px] text-brand-pale">= {child.value}</span>
                : <span className="text-[10px] text-ink-dim">ancestor only</span>}
            </span>
            <TreeView node={child} prefix={childPath} touched={touched} />
          </li>
        );
      })}
    </ul>
  );
}
