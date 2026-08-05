import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Overview } from '@/lib/types';

function Tile({
  icon,
  label,
  value,
  sub,
  index,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: string;
  index: number;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card group relative overflow-hidden p-4"
    >
      <div className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full bg-brand/10 blur-2xl transition-opacity duration-300 group-hover:opacity-150" />

      <div className="flex items-center gap-2 text-xs text-ink-dim">
        <span className={cn('text-ink-muted', accent)}>{icon}</span>
        {label}
      </div>

      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-dim">{sub}</p>}
    </motion.div>
  );
}

export function StatTiles({ overview }: { overview: Overview }) {
  const { totals, streak } = overview;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile
        index={0}
        icon={<Flame className="size-4" />}
        accent="text-warn"
        label="Current streak"
        value={`${streak.current}d`}
        sub={`Longest ${streak.longest}d`}
      />
      <Tile
        index={1}
        icon={<Target className="size-4" />}
        label="Solved"
        value={totals.solved}
        sub={`${totals.percent}% of ${totals.totalProblems}`}
      />
      <Tile
        index={2}
        icon={<Trophy className="size-4" />}
        accent="text-good"
        label="Green days"
        value={streak.greenDays}
        sub={`${streak.redDays} red ${streak.redDays === 1 ? 'day' : 'days'}`}
      />
      <Tile
        index={3}
        icon={<RotateCcw className="size-4" />}
        label="In the mix"
        value={totals.backlog}
        sub="Unsolved, will return"
      />
    </div>
  );
}
