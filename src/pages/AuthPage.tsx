import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Layers, Shuffle } from 'lucide-react';
import { Button, Field } from '@/components/ui/primitives';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/store/auth';
import { ApiError } from '@/lib/api';

const HIGHLIGHTS = [
  { icon: Layers, title: '544 problems, 19 topics', body: 'The Striver SDE and A2Z sheets, with links to LeetCode and the walkthrough video.' },
  { icon: Shuffle, title: '5 a day, never the same topic twice', body: 'A fresh set every morning, weighted toward the topics you have touched least.' },
  { icon: Flame, title: 'Miss a day, it turns red', body: 'Whatever you skipped drops back in the mix and comes around again.' },
];

export function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    email: new URLSearchParams(location.search).get('email') ?? '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={(location.state as { from?: string })?.from ?? '/dashboard'} replace />;


  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFieldErrors({});

    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        setFieldErrors(Object.fromEntries(error.details.map((detail) => [detail.field, detail.message])));
      }
      setFormError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* ---- pitch ---------------------------------------------------------- */}
      <aside className="relative hidden overflow-hidden border-r border-line px-14 py-12 lg:flex lg:flex-col xl:px-20">
        <div className="pointer-events-none absolute -left-32 top-10 size-[30rem] rounded-full bg-brand-strong/20 blur-[120px] animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-accent/10 blur-[120px]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #32323f 1px, transparent 1px), linear-gradient(to bottom, #32323f 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'linear-gradient(135deg, #000, transparent 72%)',
            WebkitMaskImage: 'linear-gradient(135deg, #000, transparent 72%)',
          }}
        />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brand-pale">Built for consistency</p>
          <h1 className="text-[clamp(2.6rem,3.2vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
            Show up every day.
            <br />
            <span className="gradient-text">The sheet handles itself.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Optimus Code hands you five problems each morning — one per topic — and keeps score. Clear them and
            the day goes green. Skip them and they come back.
          </p>

          <ul className="mt-10 grid gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }, index) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-4 rounded-xl border border-line bg-card/55 p-4 backdrop-blur-sm"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-strong bg-elevated text-brand">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-dim">{body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ---- form ----------------------------------------------------------- */}
      <main className="flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden">
            <Logo />
          </div>

          <h2 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-muted">Pick up the streak where you left it.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>

            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={set('email')}
              error={fieldErrors.email}
              required
            />

            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              onChange={set('password')}
              error={fieldErrors.password}
              required
            />

            {formError && !Object.keys(fieldErrors).length && (
              <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Sign in
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          </form>

        </motion.div>
      </main>
    </div>
  );
}
