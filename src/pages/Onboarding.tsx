import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Rocket } from 'lucide-react';
import { Button, Card } from '@/components/ui/primitives';
import { useEnroll } from '@/hooks/useChallenge';
import { useAuth } from '@/store/auth';
import { cn, browserTimezone } from '@/lib/utils';

const TARGETS = [
  { value: 3, label: 'Steady', body: '3 a day — sustainable alongside a full-time job.' },
  { value: 5, label: 'Standard', body: '5 a day — the sheet in about six weeks.', recommended: true },
  { value: 8, label: 'Sprint', body: '8 a day — interview season, all in.' },
];

export function Onboarding() {
  const { enrollment } = useAuth();
  const [target, setTarget] = useState(5);
  const enroll = useEnroll();
  const navigate = useNavigate();

  if (enrollment) return <Navigate to="/dashboard" replace />;

  const start = async () => {
    await enroll.mutateAsync(target);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl"
      >
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-line bg-card text-brand">
            <Rocket className="size-5" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">
            Join the <span className="gradient-text">daily challenge</span>
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Pick a daily target. Each morning you get that many problems, every one from a different topic. Miss
            the target and the day turns red — the unsolved ones return later.
          </p>
        </div>

        <Card className="space-y-3">
          <fieldset>
            <legend className="sr-only">Daily target</legend>
            {TARGETS.map((option) => {
              const selected = target === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'mb-2 flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3.5 transition-all last:mb-0',
                    selected
                      ? 'border-brand/60 bg-brand/[0.07]'
                      : 'border-line bg-surface/50 hover:border-line-strong hover:bg-elevated/50',
                  )}
                >
                  <input
                    type="radio"
                    name="target"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setTarget(option.value)}
                  />
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                      selected ? 'border-brand bg-brand text-canvas' : 'border-line-strong text-transparent',
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{option.label}</span>
                      {option.recommended && (
                        <span className="rounded-md border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] text-brand-pale">
                          Recommended
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-dim">{option.body}</span>
                  </span>

                  <span className="text-2xl font-semibold tabular-nums text-ink-dim">{option.value}</span>
                </label>
              );
            })}
          </fieldset>

          <Button size="lg" className="w-full" loading={enroll.isPending} onClick={start}>
            Start the challenge
          </Button>

          <p className="text-center text-[11px] text-ink-dim">
            Days roll over at midnight in {browserTimezone()}. You can change the target later in settings.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
