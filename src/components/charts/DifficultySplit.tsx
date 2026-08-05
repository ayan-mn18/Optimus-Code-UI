import { Card, CardHeader } from '@/components/ui/primitives';
import { DIFFICULTY_STEP, INK } from './viz';
import type { Overview } from '@/lib/types';

/**
 * Progress per difficulty. Difficulty is an ordered scale, so it gets an
 * ordinal ramp of a single hue (lighter = easier) with every bar directly
 * labelled — the words carry the identity, the ramp carries the order.
 */
export function DifficultySplit({ data }: { data: Overview['difficulty'] }) {
  const total = data.reduce((sum, row) => sum + row.total, 0);

  return (
    <Card>
      <CardHeader title="By difficulty" hint={`Across all ${total} problems`} />

      <div className="space-y-4">
        {data.map((row) => (
          <div key={row.difficulty}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="inline-flex items-center gap-2 text-xs text-ink-muted">
                <span className="size-2.5 rounded-[3px]" style={{ background: DIFFICULTY_STEP[row.difficulty] }} />
                {row.difficulty}
              </span>
              <span className="text-xs tabular-nums text-ink-dim">
                <span className="font-medium text-ink">{row.solved}</span>/{row.total}
              </span>
            </div>

            <div
              className="h-2 overflow-hidden rounded-full"
              style={{ background: INK.grid }}
              role="img"
              aria-label={`${row.difficulty}: ${row.solved} of ${row.total} solved, ${row.percent}%`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${row.percent}%`, background: DIFFICULTY_STEP[row.difficulty] }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
