import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, PartyPopper, AlertTriangle, Layers, Library, Snowflake } from 'lucide-react';
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
                : `${pluralize(today.target, 'problem')}, each from a different topic. Clear them before midnight to keep the day green.`}
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

      {today.extraSets.length > 0 && (
        <ExtraSetsPanel
          sets={today.extraSets}
          onToggle={onToggle}
          pendingProblemId={toggle.isPending ? toggle.variables?.problem.id : undefined}
        />
      )}

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
function ExtraSetsPanel({
  sets,
  onToggle,
  pendingProblemId,
}: {
  sets: TodayResponse['extraSets'];
  onToggle: (problem: Problem, solved: boolean) => void;
  pendingProblemId?: string;
}) {
  const solvedTotal = sets.reduce(
    (total, set) => total + set.problems.filter((problem) => problem.solved).length,
    0,
  );

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-line bg-linear-to-r from-brand-strong/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-pale">
            <Layers className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Extra sets</h2>
            <p className="mt-0.5 text-xs text-ink-dim">Newest set first. Scroll here for earlier sets.</p>
          </div>
        </div>
        <p className="self-start rounded-lg border border-line bg-elevated/70 px-2.5 py-1 text-xs text-ink-muted sm:self-auto">
          {pluralize(sets.length, 'set')} · {pluralize(solvedTotal, 'bonus solve')}
        </p>
      </div>

      <div
        className="max-h-[38rem] overflow-y-auto overscroll-contain p-3 sm:p-4"
        tabIndex={0}
        aria-label="Extra sets, newest first"
      >
        <div className="space-y-3">
          {sets.map((set, setIndex) => {
            const solved = set.problems.filter((problem) => problem.solved).length;
            const complete = solved === set.problems.length;
            const progress = set.problems.length ? (solved / set.problems.length) * 100 : 0;

            return (
              <motion.section
                key={set.round}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-line bg-surface/55 p-3 sm:p-4"
                aria-labelledby={`extra-set-${set.round}`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 id={`extra-set-${set.round}`} className="text-sm font-semibold">
                      Extra set {set.round - 1}
                    </h3>
                    {setIndex === 0 && (
                      <span className="rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-pale">
                        Latest
                      </span>
                    )}
                    {complete && <CheckCircle2 className="size-4 text-good" aria-label="Complete" />}
                  </div>
                  <p className="text-xs tabular-nums text-ink-dim">
                    {solved}/{set.problems.length} solved · bonus
                  </p>
                </div>

                <div className="mb-3 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-strong to-accent transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <ul className="space-y-2">
                  {set.problems.map((problem, index) => (
                    <ProblemRow
                      key={problem.id}
                      problem={problem}
                      index={index}
                      onToggle={onToggle}
                      pending={pendingProblemId === problem.id}
                    />
                  ))}
                </ul>
              </motion.section>
            );
          })}
        </div>
      </div>
    </Card>
  );
}


/**
 * Shown once the target is met. Two equal ways to keep going — another dealt
 * set, or the open library — rather than only pointing at the library.
 */
function KeepGoing({ today }: { today: TodayResponse }) {
  const extend = useExtendToday();
  const latestSet = today.extraSets[0];
  const latestSetComplete = !latestSet || latestSet.problems.every((problem) => problem.solved);

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
          disabled={!today.canExtend || !latestSetComplete}
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
          ? 'No unsolved problems remain to deal.'
          : !latestSetComplete
            ? `Finish extra set ${latestSet.round - 1} before asking for another.`
            : today.extraSets.length
              ? 'Current set complete. Your next set will appear first below.'
              : 'A new set keeps the one-per-topic rule. The library lets you choose freely.'}
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
