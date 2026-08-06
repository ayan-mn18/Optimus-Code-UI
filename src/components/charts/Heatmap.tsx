import { useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/primitives';
import { formatDate } from '@/lib/utils';
import { heatStep, RAMP, STATUS } from './viz';
import type { HeatCell } from '@/lib/types';

const CELL = 12;
const GAP = 3;
const WEEKDAYS = ['Mon', 'Wed', 'Fri'];

/**
 * Solves per day, laid out as calendar weeks. Fill = magnitude (one hue).
 * A red day carries an extra ring, so day state is a second channel rather
 * than a second hue.
 */
export function Heatmap({ cells, target }: { cells: HeatCell[]; target: number }) {
  const [hovered, setHovered] = useState<HeatCell | null>(null);

  const { weeks, months } = useMemo(() => {
    // Pad the first week so columns line up on weekday rows (Mon-first).
    const first = cells[0];
    const offset = first ? (new Date(`${first.date}T00:00:00`).getDay() + 6) % 7 : 0;
    const padded: (HeatCell | null)[] = [...Array<null>(offset).fill(null), ...cells];

    const grouped: (HeatCell | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) grouped.push(padded.slice(i, i + 7));

    const labels: { label: string; column: number }[] = [];
    let previousMonth = '';
    grouped.forEach((week, column) => {
      const day = week.find(Boolean);
      if (!day) return;
      const month = day.date.slice(0, 7);
      if (month !== previousMonth) {
        previousMonth = month;
        labels.push({ label: formatDate(day.date, { month: 'short' }), column });
      }
    });

    return { weeks: grouped, months: labels };
  }, [cells]);

  const width = weeks.length * (CELL + GAP);

  return (
    <Card>
      <CardHeader
        title="Consistency"
        hint={`${cells.filter((cell) => cell.count > 0).length} active days in the last ${cells.length}`}
        action={<Legend />}
      />

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2" style={{ minWidth: width + 34 }}>
          <div className="flex flex-col justify-between pt-[18px] pb-0.5 text-[10px] text-ink-dim">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div>
            <div className="relative mb-1 h-3.5" style={{ width }}>
              {months.map(({ label, column }) => (
                <span
                  key={`${label}-${column}`}
                  className="absolute top-0 text-[10px] text-ink-dim"
                  style={{ left: column * (CELL + GAP) }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap: GAP }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: GAP }}>
                  {week.map((cell, dayIndex) =>
                    cell ? (
                      <button
                        key={cell.date}
                        type="button"
                        aria-label={`${formatDate(cell.date)}: ${cell.count} solved, ${describe(cell)}`}
                        onMouseEnter={() => setHovered(cell)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(cell)}
                        onBlur={() => setHovered(null)}
                        className="rounded-[3px] transition-transform hover:scale-125"
                        style={{
                          width: CELL,
                          height: CELL,
                          background: heatStep(cell.count, cell.target ?? target),
                          // A green day is already the deepest fill, so only the
                          // exceptions carry a ring — red for a missed day, blue
                          // for one a freeze covered.
                          boxShadow:
                            cell.status === 'missed'
                              ? `0 0 0 1.5px ${STATUS.missed}99`
                              : cell.status === 'frozen'
                                ? `0 0 0 1.5px ${STATUS.frozen}`
                                : undefined,
                        }}
                      />
                    ) : (
                      <div key={`pad-${weekIndex}-${dayIndex}`} style={{ width: CELL, height: CELL }} />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex min-h-8 items-center justify-between gap-4 text-xs">
        <p className="text-ink-muted" role="status">
          {hovered ? (
            <>
              <span className="font-medium text-ink">{formatDate(hovered.date, { dateStyle: 'medium' })}</span>
              <span className="text-ink-dim"> · </span>
              {hovered.count} solved
              <span className="text-ink-dim"> · </span>
              {describe(hovered)}
            </>
          ) : (
            <span className="text-ink-dim">Hover a day for detail</span>
          )}
        </p>

        <div className="flex items-center gap-1.5 text-[10px] text-ink-dim">
          <span>Less</span>
          {['#191922', ...RAMP].map((color) => (
            <span key={color} className="size-2.5 rounded-[3px]" style={{ background: color }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </Card>
  );
}

function describe(cell: HeatCell) {
  if (cell.status === 'complete') return 'target met';
  if (cell.status === 'frozen') return 'covered by a streak freeze';
  if (cell.status === 'missed') return 'missed — problems recycled';
  if (cell.status === 'active') return 'in progress';
  return 'no challenge';
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-ink-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-[3px]" style={{ background: RAMP[4] }} />
        Target met
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-2.5 rounded-[3px]"
          style={{ background: RAMP[0], boxShadow: `0 0 0 1.5px ${STATUS.missed}99` }}
        />
        Red day
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-2.5 rounded-[3px]"
          style={{ background: '#191922', boxShadow: `0 0 0 1.5px ${STATUS.frozen}` }}
        />
        Frozen
      </span>
    </div>
  );
}
