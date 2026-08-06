import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, CalendarCheck, EyeOff } from 'lucide-react';
import { Card, Skeleton, EmptyState } from '@/components/ui/primitives';
import { useLeaderboard } from '@/hooks/useChallenge';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { Leaderboard as Board, LeaderboardEntry } from '@/lib/types';

const METRICS: { value: Board['metric']; label: string; icon: typeof Flame; column: string }[] = [
  { value: 'streak', label: 'Streak', icon: Flame, column: 'Streak' },
  { value: 'solved', label: 'Solved', icon: Target, column: 'Solved' },
  { value: 'consistency', label: 'Green days', icon: CalendarCheck, column: 'Green days' },
];

export function Leaderboard() {
  const [metric, setMetric] = useState<Board['metric']>('streak');
  const { data, isLoading } = useLeaderboard(metric);
  const { user } = useAuth();

  const active = METRICS.find((entry) => entry.value === metric)!;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-dim">Standings</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-ink-muted">
          A streak only counts while it is alive — miss a day with no freeze left and it drops to zero here.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-line bg-surface/80 p-0.5">
          {METRICS.map((entry) => (
            <button
              key={entry.value}
              type="button"
              onClick={() => setMetric(entry.value)}
              aria-pressed={metric === entry.value}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors',
                metric === entry.value ? 'bg-elevated text-ink' : 'text-ink-dim hover:text-ink-muted',
              )}
            >
              <entry.icon className="size-3.5" />
              {entry.label}
            </button>
          ))}
        </div>

        {data && <span className="text-xs text-ink-dim">{data.total} on the board</span>}
      </div>

      {user && !user.showOnLeaderboard && (
        <Card className="flex items-start gap-3 border-warn/25 bg-warn/[0.05]">
          <EyeOff className="mt-0.5 size-4 shrink-0 text-warn" />
          <p className="text-sm text-ink-muted">
            You are hidden from the board. Your own standing is still shown below — turn visibility back on in
            settings to appear for everyone else.
          </p>
        </Card>
      )}

      {isLoading && (
        <Card className="space-y-3">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </Card>
      )}

      {data && data.entries.length === 0 && (
        <EmptyState title="Nobody on the board yet" body="Be the first — clear today's set." />
      )}

      {data && data.entries.length > 0 && (
        <Card className="p-2">
          <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem] items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-wider text-ink-dim">
            <span>#</span>
            <span>Developer</span>
            <span className="text-right">{active.column}</span>
            <span className="text-right">Solved</span>
          </div>

          <ul>
            {data.entries.map((entry, index) => (
              <Row key={entry.userId} entry={entry} metric={metric} index={index} isMe={entry.userId === user?.id} />
            ))}
          </ul>

          {data.me && !data.me.inTop && (
            <>
              <div className="my-2 h-px rule-fade" />
              <ul>
                <Row entry={data.me} metric={metric} index={0} isMe />
              </ul>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

function Row({
  entry,
  metric,
  index,
  isMe,
}: {
  entry: LeaderboardEntry;
  metric: Board['metric'];
  index: number;
  isMe: boolean;
}) {
  const primary =
    metric === 'streak' ? `${entry.streak}d` : metric === 'solved' ? entry.solved : entry.greenDays;

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
      className={cn(
        'grid grid-cols-[2.5rem_1fr_5rem_5rem] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
        isMe ? 'bg-brand/[0.08] ring-1 ring-brand/25' : 'hover:bg-elevated/50',
      )}
    >
      <span className={cn('text-sm tabular-nums', entry.rank && entry.rank <= 3 ? 'text-ink' : 'text-ink-dim')}>
        {entry.rank ? (entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank) : '—'}
      </span>

      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar name={entry.name} />
        <span className="min-w-0">
          <span className="block truncate text-sm text-ink">
            {entry.name}
            {isMe && <span className="ml-1.5 text-[11px] text-brand-pale">you</span>}
          </span>
          <span className="block text-[11px] text-ink-dim">best {entry.longestStreak}d</span>
        </span>
      </span>

      <span className="text-right text-sm font-medium tabular-nums text-ink">{primary}</span>
      <span className="text-right text-sm tabular-nums text-ink-dim">{entry.solved}</span>
    </motion.li>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-strong to-accent text-[11px] font-semibold text-canvas"
    >
      {initials}
    </span>
  );
}
