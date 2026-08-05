import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, PartyPopper, AlertTriangle } from 'lucide-react';
import { DayRing } from '@/components/charts/DayRing';
import { ProblemRow } from './ProblemRow';
import { Card } from '@/components/ui/primitives';
import { formatDate, pluralize } from '@/lib/utils';
import { useToggleSolve } from '@/hooks/useChallenge';
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
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-good/25 bg-good/[0.06] px-4 py-3">
                  <PartyPopper className="size-5 shrink-0 text-good" />
                  <p className="text-sm text-ink-muted">
                    Target met. Head to{' '}
                    <a href="/problems" className="text-brand-pale underline underline-offset-2">
                      all problems
                    </a>{' '}
                    to keep going — extras count as bonus.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

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

function RedDayNotice({ closedDays }: { closedDays: TodayResponse['closedDays'] }) {
  const missed = closedDays.filter((day) => day.status === 'missed');
  if (!missed.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-bad/30 bg-bad/[0.07] px-4 py-3"
      role="status"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-bad" />
      <p className="text-sm text-ink-muted">
        <span className="font-medium text-ink">
          {missed.length === 1 ? formatDate(missed[0].date) : `${missed.length} days`}
        </span>{' '}
        ended short of the target and {missed.length === 1 ? 'was' : 'were'} marked red. Those problems went back
        into the mix and will resurface on a future day.
      </p>
    </motion.div>
  );
}
