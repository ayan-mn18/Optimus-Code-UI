import { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Users } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

export function WaitlistForm({ className, compact }: { className?: string; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'joined' | 'already'>('idle');
  const [error, setError] = useState('');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    api
      .waitlistCount()
      .then(({ count: total }) => setCount(total))
      .catch(() => setCount(null));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setState('sending');
    setError('');

    try {
      const result = await api.joinWaitlist({ email, referrer: document.referrer || undefined });
      setCount(result.count);
      setState(result.alreadyJoined ? 'already' : 'joined');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server');
      setState('idle');
    }
  }

  const done = state === 'joined' || state === 'already';

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl border border-good/30 bg-good/[0.07] px-4 py-3"
            role="status"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-good text-canvas">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <p className="text-sm text-ink-muted">
              {state === 'already' ? (
                <>You&rsquo;re already on the list — sit tight.</>
              ) : (
                <>
                  <span className="font-medium text-ink">You&rsquo;re in.</span> We&rsquo;ll email you the moment
                  your seat opens.
                </>
              )}
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('flex gap-2', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row')}
            noValidate
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-invalid={Boolean(error)}
                className={cn(
                  'h-12 w-full rounded-xl border border-line bg-surface/80 px-4 text-sm text-ink backdrop-blur',
                  'placeholder:text-ink-dim hover:border-line-strong focus:border-brand/70 focus:outline-none',
                  error && 'border-bad/60',
                )}
              />
            </label>

            <button
              type="submit"
              disabled={state === 'sending'}
              className={cn(
                'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white',
                'bg-linear-to-br from-brand-strong to-brand transition-all hover:brightness-110',
                'shadow-[0_10px_30px_-12px] shadow-brand-strong/80 disabled:opacity-60',
              )}
            >
              {state === 'sending' ? 'Joining…' : 'Join the waitlist'}
              <ArrowRight className="size-4" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-2.5 flex min-h-5 items-center gap-2 text-xs">
        {error ? (
          <span className="text-bad" role="alert">
            {error}
          </span>
        ) : count !== null && count > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-ink-dim">
            <Users className="size-3.5" />
            {count.toLocaleString()} {count === 1 ? 'developer' : 'developers'} waiting
          </span>
        ) : (
          <span className="text-ink-dim">No spam. One email when your seat opens.</span>
        )}
      </div>
    </div>
  );
}
