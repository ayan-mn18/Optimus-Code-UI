import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Share2, Check } from 'lucide-react';
import { Button, Card, Skeleton, EmptyState } from '@/components/ui/primitives';
import { RecapCard, CARD_WIDTH, CARD_HEIGHT } from '@/components/recap/RecapCard';
import { canShareImage, downloadCard, shareCard } from '@/components/recap/exportCard';
import { useRecap } from '@/hooks/useChallenge';
import { formatDate } from '@/lib/utils';

export function Recap() {
  const [weeksAgo, setWeeksAgo] = useState(0);
  const { data: recap, isLoading, isError, error } = useRecap(weeksAgo);
  const cardRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<'idle' | 'working' | 'saved' | 'shared'>('idle');
  const [failure, setFailure] = useState('');

  const filename = recap ? `optimus-code-week-${recap.weekStart}.png` : 'optimus-code-week.png';

  const run = async (action: 'download' | 'share') => {
    if (!cardRef.current || !recap) return;
    setState('working');
    setFailure('');

    try {
      if (action === 'download') {
        await downloadCard(cardRef.current, filename, CARD_WIDTH, CARD_HEIGHT);
        setState('saved');
      } else {
        const shared = await shareCard(
          cardRef.current,
          filename,
          CARD_WIDTH,
          CARD_HEIGHT,
          `${recap.totals.solved} problems this week on Optimus Code.`,
        );
        setState(shared ? 'shared' : 'idle');
      }
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Could not export the card');
      setState('idle');
    } finally {
      setTimeout(() => setState('idle'), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-dim">Weekly recap</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {recap
              ? `${formatDate(recap.weekStart, { day: 'numeric', month: 'short' })} – ${formatDate(recap.weekEnd, { day: 'numeric', month: 'short' })}`
              : 'Your week'}
          </h1>
          {recap && !recap.isCurrentWeek && <p className="mt-1 text-xs text-ink-dim">{recap.weeksAgo} weeks ago</p>}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface/80 p-0.5">
          <button
            type="button"
            onClick={() => setWeeksAgo((week) => Math.min(week + 1, 52))}
            aria-label="Previous week"
            className="grid size-8 place-items-center rounded-md text-ink-dim transition-colors hover:bg-elevated hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="px-2 text-xs text-ink-muted">{weeksAgo === 0 ? 'This week' : `−${weeksAgo}w`}</span>
          <button
            type="button"
            onClick={() => setWeeksAgo((week) => Math.max(week - 1, 0))}
            disabled={weeksAgo === 0}
            aria-label="Next week"
            className="grid size-8 place-items-center rounded-md text-ink-dim transition-colors hover:bg-elevated hover:text-ink disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {isError && (
        <Card className="border-bad/30">
          <p className="text-sm text-ink-muted">{error.message}</p>
        </Card>
      )}

      {isLoading && <Skeleton className="aspect-[1080/1350] w-full rounded-2xl" />}

      {recap && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden rounded-2xl border border-line"
          >
            <RecapCard ref={cardRef} recap={recap} />
          </motion.div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              loading={state === 'working'}
              onClick={() => run('download')}
              icon={state === 'saved' ? <Check className="size-4" /> : <Download className="size-4" />}
            >
              {state === 'saved' ? 'Saved' : 'Download PNG'}
            </Button>

            {canShareImage() && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => run('share')}
                icon={state === 'shared' ? <Check className="size-4" /> : <Share2 className="size-4" />}
              >
                {state === 'shared' ? 'Shared' : 'Share'}
              </Button>
            )}
          </div>

          {failure && (
            <p role="alert" className="text-xs text-bad">
              {failure}
            </p>
          )}

          <p className="text-center text-[11px] text-ink-dim">
            Exported at {CARD_WIDTH * 2}×{CARD_HEIGHT * 2} — sized for a story or a post.
          </p>
        </>
      )}

      {recap && recap.totals.solved === 0 && recap.isCurrentWeek && (
        <EmptyState
          title="This week is still blank"
          body="Solve today's set and the card fills in as the week goes."
        />
      )}
    </div>
  );
}
