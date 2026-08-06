import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, PartyPopper, AlertTriangle, Layers, Library, Snowflake } from 'lucide-react';
import { DayRing } from '@/components/charts/DayRing';
import { ProblemRow } from './ProblemRow';
import { Button, Card } from '@/components/ui/primitives';
import { formatDate, pluralize } from '@/lib/utils';
import { useToggleSolve, useExtendToday } from '@/hooks/useChallenge';
import type { Problem, TodayResponse } from '@/lib/types';

export function TodayPanel({ today }: { today: TodayResponse }) {
  const toggle = useToggleSolve();
  const remaining = Math.max(today.target - today.solvedCount, 0);

  const onToggle = (problem: Problem, solved: boolean) => toggle.mutate({ problem, solved });

  return (
    <div className="space-y-4">
      <RedDayNotice closedDays={today.closedDays} />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-6 border-b border-line bg-linear-to-br from-brand-strong/10 via-transparent to-accent/5 p-5 sm:flex-row sm:items-center">
          <DayRing solved={today.solvedCount} target={today.target} isComplete={today.isComplete} />

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-ink-dim">
              {formatDate(today.date, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {today.isComplete ? (
                <span className="gradient-text">Day cleared. Nice.</span>
              ) : (
                <>
                  {pluralize(remaining, 'problem')} <span className="text-ink-muted">to go</span>
                </>
              )}
            </h1>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              {today.isComplete
                ? 'Everything past this point is bonus — the streak is already safe.'
                : 'Five problems, five different topics. Clear them all before midnight to keep the day green.'}
            </p>

            {today.bonusCount > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs text-brand-pale">
                <Sparkles className="size-3.5" />
                {pluralize(today.bonusCount, 'bonus solve')} today
              </p>
            )}
          </div>
        </div>

        <div className="p-5">
          <ul className="space-y-2">
            {today.problems.map((problem, index) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                index={index}
                onToggle={onToggle}
                pending={toggle.isPending && toggle.variables?.problem.id === problem.id}
              />
            ))}
          </ul>

          <AnimatePresence>
            {today.isComplete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <KeepGoing today={today} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {today.extraSets.map((set) => (
        <Card key={set.round}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="size-4 text-brand" />
              Extra set {set.round - 1}
            </h2>
            <p className="text-xs text-ink-dim">
              {set.problems.filter((problem) => problem.solved).length}/{set.problems.length} solved · bonus
            </p>
          </div>
          <ul className="space-y-2">
            {set.problems.map((problem, index) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                index={index}
                onToggle={onToggle}
                pending={toggle.isPending && toggle.variables?.problem.id === problem.id}
              />
            ))}
          </ul>
        </Card>
      ))}

      {today.bonusProblems.length > 0 && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-brand" />
            Bonus solves today
          </h2>
          <ul className="space-y-2">
            {today.bonusProblems.map((problem, index) => (
              <ProblemRow key={problem.id} problem={problem} index={index} compact onToggle={onToggle} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/**
 * Shown once the target is met. Two equal ways to keep going — another dealt
 * set, or the open library — rather than only pointing at the library.
 */
function KeepGoing({ today }: { today: TodayResponse }) {
  const extend = useExtendToday();
  const allSolved = today.extraSets.every((set) => set.problems.every((problem) => problem.solved));

  return (
    <div className="mt-4 rounded-xl border border-good/25 bg-good/[0.05] p-4">
      <div className="flex items-center gap-3">
        <PartyPopper className="size-5 shrink-0 text-good" />
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">Target met.</span> The streak is safe — anything from here is
          bonus.
        </p>
      </div>

      {extend.isError && (
        <p role="alert" className="mt-3 text-xs text-bad">
          {extend.error.message}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => extend.mutate()}
          loading={extend.isPending}
          disabled={!today.canExtend || !allSolved}
          icon={<Sparkles className="size-4" />}
          className="flex-1"
        >
          Deal another {today.target}
        </Button>

        <Link
          to="/problems"
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-line-strong bg-elevated/60 px-4 text-sm font-medium transition-colors hover:border-brand/50 hover:bg-elevated"
        >
          <Library className="size-4" />
          Pick your own
        </Link>
      </div>

      <p className="mt-2.5 text-[11px] text-ink-dim">
        {!today.canExtend
          ? 'That is as many sets as one day gets — the library is still open.'
          : !allSolved
            ? 'Finish the current extra set before asking for another.'
            : 'A new set keeps the one-per-topic rule. The library lets you go wherever you want.'}
      </p>
    </div>
  );
}

function RedDayNotice({ closedDays }: { closedDays: TodayResponse['closedDays'] }) {
  const missed = closedDays.filter((day) => day.status === 'missed');
  const frozen = closedDays.filter((day) => day.status === 'frozen');
  if (!missed.length && !frozen.length) return null;

  const label = (days: typeof closedDays) =>
    days.length === 1 ? formatDate(days[0].date) : `${days.length} days`;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" role="status">
      {frozen.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/[0.07] px-4 py-3">
          <Snowflake className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">{label(frozen)}</span> came up short, so a streak freeze was
            spent to cover it. Your streak is intact.
          </p>
        </div>
      )}

      {missed.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-bad/30 bg-bad/[0.07] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-bad" />
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-ink">{label(missed)}</span> ended short of the target and{' '}
            {missed.length === 1 ? 'was' : 'were'} marked red. Those problems went back into the mix and will
            resurface on a future day.
          </p>
        </div>
      )}
    </motion.div>
  );
}
