import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Download,
  Flame,
  Share2,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { canShareImage, downloadCard, shareCard } from '@/components/recap/exportCard';
import {
  MilestoneShareCard,
  MILESTONE_CARD_HEIGHT,
  MILESTONE_CARD_WIDTH,
} from './MilestoneShareCard';
import { formatDate, pluralize } from '@/lib/utils';
import type { Difficulty, MilestoneRecap } from '@/lib/types';

const SLIDE_COUNT = 4;
const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'bg-good',
  Medium: 'bg-warn',
  Hard: 'bg-bad',
};

export function MilestoneModal({
  recap,
  onDismiss,
}: {
  recap: MilestoneRecap;
  onDismiss: () => Promise<void>;
}) {
  const [slide, setSlide] = useState(0);
  const [closing, setClosing] = useState(false);
  const [exportState, setExportState] = useState<'idle' | 'working' | 'saved' | 'shared'>('idle');
  const [failure, setFailure] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<SVGSVGElement>(null);
  const filename = `optimus-code-${recap.milestone}-milestone.png`;
  const favoriteDifficulty = useMemo(
    () =>
      (Object.entries(recap.difficulty) as [Difficulty, number][]).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      )[0],
    [recap.difficulty],
  );

  const close = useCallback(async () => {
    if (closing) return;
    setClosing(true);
    setFailure('');
    try {
      await onDismiss();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Could not close this recap');
      setClosing(false);
    }
  }, [closing, onDismiss]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') void close();
      if (event.key === 'ArrowRight') setSlide((current) => Math.min(current + 1, SLIDE_COUNT - 1));
      if (event.key === 'ArrowLeft') setSlide((current) => Math.max(current - 1, 0));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const exportRecap = async (action: 'download' | 'share') => {
    if (!cardRef.current) return;
    setExportState('working');
    setFailure('');

    try {
      if (action === 'download') {
        await downloadCard(cardRef.current, filename, MILESTONE_CARD_WIDTH, MILESTONE_CARD_HEIGHT);
        setExportState('saved');
      } else {
        const shared = await shareCard(
          cardRef.current,
          filename,
          MILESTONE_CARD_WIDTH,
          MILESTONE_CARD_HEIGHT,
          `${recap.milestone} problems solved on Optimus Code. Next stop: ${recap.nextMilestone}.`,
        );
        setExportState(shared ? 'shared' : 'idle');
      }
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Could not export your milestone');
      setExportState('idle');
    } finally {
      window.setTimeout(() => setExportState('idle'), 2500);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-canvas/90 p-3 backdrop-blur-xl sm:p-6">
      <div className="flex min-h-full items-center justify-center">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-title"
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-brand/25 bg-card shadow-[0_32px_120px_-30px_rgba(124,92,255,0.55)]"
        >
          <div className="absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_20%_0%,rgba(124,92,255,0.28),transparent_58%),radial-gradient(circle_at_85%_0%,rgba(34,211,238,0.16),transparent_45%)]" />

          <div className="relative flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2" aria-label={`Slide ${slide + 1} of ${SLIDE_COUNT}`}>
              {Array.from({ length: SLIDE_COUNT }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSlide(index)}
                  aria-label={`Show milestone page ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === slide ? 'w-8 bg-brand' : 'w-3 bg-line-strong hover:bg-ink-dim'
                  }`}
                />
              ))}
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => void close()}
              disabled={closing}
              aria-label="Close milestone recap"
              className="grid size-9 place-items-center rounded-full text-ink-dim transition-colors hover:bg-elevated hover:text-ink disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative min-h-[34rem] px-5 py-7 sm:px-10 sm:py-9">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {slide === 0 && <HeroSlide recap={recap} />}
                {slide === 1 && <PatternSlide recap={recap} favoriteDifficulty={favoriteDifficulty} />}
                {slide === 2 && <RhythmSlide recap={recap} />}
                {slide === 3 && (
                  <ShareSlide
                    recap={recap}
                    cardRef={cardRef}
                    exportState={exportState}
                    onExport={exportRecap}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-between gap-3 border-t border-white/5 px-4 py-4 sm:px-6">
            <Button
              variant="ghost"
              onClick={() => setSlide((current) => Math.max(current - 1, 0))}
              disabled={slide === 0}
              icon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>

            {slide < SLIDE_COUNT - 1 ? (
              <Button
                onClick={() => setSlide((current) => Math.min(current + 1, SLIDE_COUNT - 1))}
                icon={<ArrowRight className="size-4" />}
              >
                Keep going
              </Button>
            ) : (
              <Button loading={closing} onClick={() => void close()} icon={<Check className="size-4" />}>
                Done
              </Button>
            )}
          </div>

          {failure && (
            <p role="alert" className="relative border-t border-bad/20 bg-bad/10 px-6 py-2 text-center text-xs text-bad">
              {failure}
            </p>
          )}
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}

function HeroSlide({ recap }: { recap: MilestoneRecap }) {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ rotate: -8, scale: 0.7 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        className="grid size-20 place-items-center rounded-3xl border border-brand/30 bg-brand/15 text-brand-pale shadow-[0_0_70px_rgba(124,92,255,0.35)]"
      >
        <Trophy className="size-10" />
      </motion.div>
      <p className="mt-7 text-xs font-medium uppercase tracking-[0.28em] text-brand-pale">Milestone unlocked</p>
      <h1 id="milestone-title" className="mt-3 text-7xl font-bold tracking-tight sm:text-8xl">
        <span className="gradient-text">{recap.milestone}</span>
      </h1>
      <p className="mt-1 text-xl font-medium text-ink">problems solved</p>
      <p className="mt-5 max-w-lg text-sm leading-6 text-ink-muted">{recap.headline}</p>
      <p className="mt-4 text-xs text-ink-dim">
        Reached {formatDate(recap.achievedOn, { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  );
}

function PatternSlide({
  recap,
  favoriteDifficulty,
}: {
  recap: MilestoneRecap;
  favoriteDifficulty: [Difficulty, number];
}) {
  const maxTopic = recap.topTopics[0]?.count ?? 1;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-brand-pale">Your pattern</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Where curiosity took you</h2>
      <p className="mt-2 text-sm text-ink-muted">Practice history shows preference. No guesswork, just solved problems.</p>

      <div className="mt-7 space-y-3">
        {recap.topTopics.map((topic, index) => (
          <div key={topic.topic} className="rounded-xl border border-line bg-surface/60 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{index + 1}. {topic.topic}</span>
              <span className="tabular-nums text-ink-muted">{pluralize(topic.count, 'solve')}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(topic.count / maxTopic) * 100}%` }}
                className="h-full rounded-full bg-linear-to-r from-brand-strong to-accent"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {(Object.entries(recap.difficulty) as [Difficulty, number][]).map(([level, count]) => (
          <div key={level} className="rounded-xl border border-line bg-elevated/45 p-3 text-center">
            <span className={`mx-auto block size-2 rounded-full ${DIFFICULTY_COLORS[level]}`} />
            <p className="mt-2 text-2xl font-semibold tabular-nums">{count}</p>
            <p className="text-xs text-ink-dim">{level}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-ink-muted">
        Your most-practiced level: <span className="font-medium text-ink">{favoriteDifficulty[0]}</span>
      </p>
    </div>
  );
}

function RhythmSlide({ recap }: { recap: MilestoneRecap }) {
  const rhythm = recap.rhythm;
  const cards = [
    { icon: CalendarDays, label: 'Active days', value: String(recap.totals.activeDays), hint: `${rhythm.averagePerActiveDay} per active day` },
    { icon: Flame, label: 'Best streak', value: `${recap.streak.longest}d`, hint: `${recap.streak.greenDays} green days` },
    { icon: Sparkles, label: 'Bonus solves', value: String(recap.totals.bonus), hint: 'Beyond daily targets' },
    { icon: Target, label: 'Weekly pace', value: String(rhythm.weeklyPace), hint: 'Problems per week' },
  ];

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.24em] text-accent">Your rhythm</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">How the work happened</h2>
      <div className="mt-7 grid grid-cols-2 gap-3">
        {cards.map(({ icon: Icon, label, value, hint }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
            <Icon className="size-5 text-brand" />
            <p className="mt-4 text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm font-medium text-ink-muted">{label}</p>
            <p className="mt-0.5 text-xs text-ink-dim">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/[0.06] p-5">
        <p className="text-xs uppercase tracking-wider text-accent">Strongest rhythm</p>
        <p className="mt-2 text-lg font-medium">
          {rhythm.strongestDay ?? 'Your active days'} carried the most momentum.
        </p>
        {rhythm.bestDate && (
          <p className="mt-1 text-sm text-ink-muted">
            Best single day: {rhythm.bestDateCount} solved on {formatDate(rhythm.bestDate)}.
          </p>
        )}
      </div>
    </div>
  );
}

function ShareSlide({
  recap,
  cardRef,
  exportState,
  onExport,
}: {
  recap: MilestoneRecap;
  cardRef: RefObject<SVGSVGElement>;
  exportState: 'idle' | 'working' | 'saved' | 'shared';
  onExport: (action: 'download' | 'share') => Promise<void>;
}) {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="overflow-hidden rounded-2xl border border-line shadow-2xl">
        <MilestoneShareCard ref={cardRef} recap={recap} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-good">Next chapter</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">{recap.nextMilestone} comes next.</h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Keep your {pluralize(recap.recommendation.daily, 'problem')} daily target. At that rhythm, the next 50
          takes about {pluralize(recap.recommendation.projectedDays, 'active day')}.
        </p>

        <div className="mt-5 rounded-xl border border-good/20 bg-good/[0.06] p-4">
          <p className="text-xs uppercase tracking-wider text-good">Your simple plan</p>
          <p className="mt-2 text-lg font-medium">{recap.recommendation.daily} each active day</p>
          <p className="mt-1 text-xs text-ink-muted">Steady beats heroic. Keep the target boring.</p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button
            onClick={() => void onExport('download')}
            loading={exportState === 'working'}
            icon={exportState === 'saved' ? <Check className="size-4" /> : <Download className="size-4" />}
          >
            {exportState === 'saved' ? 'Saved' : 'Download card'}
          </Button>
          {canShareImage() && (
            <Button
              variant="outline"
              onClick={() => void onExport('share')}
              icon={exportState === 'shared' ? <Check className="size-4" /> : <Share2 className="size-4" />}
            >
              {exportState === 'shared' ? 'Shared' : 'Share milestone'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
