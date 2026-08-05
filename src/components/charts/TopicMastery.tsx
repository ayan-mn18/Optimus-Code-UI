import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/primitives';
import { INK, DIFFICULTY_STEP } from './viz';
import type { TopicStat } from '@/lib/types';

/**
 * Solved-per-topic as thin horizontal bars: one measure, so one hue. Each bar
 * is directly labelled with its own count, so no legend is needed.
 */
export function TopicMastery({ topics }: { topics: TopicStat[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader
        title="Topic mastery"
        hint="Problems solved in each topic of the sheets"
        action={
          <Link
            to="/problems"
            className="inline-flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-brand"
          >
            Browse all <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      <ul className="space-y-2.5">
        {topics.map((topic) => {
          const isHovered = hovered === topic.topic;

          return (
            <li
              key={topic.topic}
              onMouseEnter={() => setHovered(topic.topic)}
              onMouseLeave={() => setHovered(null)}
              className="grid grid-cols-[9.5rem_1fr_3.25rem] items-center gap-3"
            >
              <span className="truncate text-xs text-ink-muted" title={topic.topic}>
                {topic.topic}
              </span>

              {/* Solved portion is split by difficulty — same hue, ordinal steps,
                  with a surface-colored gap so the segments stay separable. */}
              <div
                className="flex h-2 gap-0.5 overflow-hidden rounded-full"
                style={{ background: INK.grid }}
                role="img"
                aria-label={`${topic.topic}: ${topic.solved} of ${topic.total} solved — ${topic.easy} easy, ${topic.medium} medium, ${topic.hard} hard`}
              >
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                  const count = topic[level.toLowerCase() as 'easy' | 'medium' | 'hard'];
                  if (!count) return null;
                  return (
                    <span
                      key={level}
                      className="h-full rounded-full transition-[width,filter] duration-500"
                      style={{
                        width: `${(count / topic.total) * 100}%`,
                        background: DIFFICULTY_STEP[level],
                        filter: isHovered ? 'brightness(1.2)' : undefined,
                      }}
                    />
                  );
                })}
              </div>

              <span className="text-right text-xs tabular-nums text-ink-dim">
                <span className={isHovered ? 'text-ink' : 'text-ink-muted'}>{topic.solved}</span>
                <span className="text-ink-dim">/{topic.total}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[11px] text-ink-dim">
        Solved, by difficulty:{' '}
        {(['Easy', 'Medium', 'Hard'] as const).map((level, index) => (
          <span key={level}>
            {index > 0 && <span className="text-ink-dim"> · </span>}
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-[2px]" style={{ background: DIFFICULTY_STEP[level] }} />
              {level}
            </span>
          </span>
        ))}
      </p>
    </Card>
  );
}
