import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Layers, Shuffle } from 'lucide-react';
import { Button, Field } from '@/components/ui/primitives';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/store/auth';
import { ApiError } from '@/lib/api';

const HIGHLIGHTS = [
  { icon: Layers, title: '191 problems, 13 topics', body: 'The full Striver SDE Sheet, links to LeetCode and the walkthrough video.' },
  { icon: Shuffle, title: '5 a day, never the same topic twice', body: 'A fresh set every morning, weighted toward the topics you have touched least.' },
  { icon: Flame, title: 'Miss a day, it turns red', body: 'Whatever you skipped drops back in the mix and comes around again.' },
];

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ name: '', email: '', password: '' });
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
      if (isSignup) await signup(values);
      else await login({ email: values.email, password: values.password });
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
      <aside className="relative hidden overflow-hidden border-r border-line px-12 py-14 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-32 top-10 size-[30rem] rounded-full bg-brand-strong/20 blur-[120px] animate-[float_9s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-accent/10 blur-[120px]" />

        <Logo />

        <div className="relative mt-auto max-w-lg">
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-tight">
            Show up every day.
            <br />
            <span className="gradient-text">The sheet takes care of itself.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            Optimus Code hands you five problems each morning — one per topic — and keeps score. Clear them and
            the day goes green. Skip them and they come back.
          </p>

          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }, index) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-3.5"
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-card text-brand">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-dim">{body}</p>
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

          <h2 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            {isSignup ? 'Two fields and a password. That is the whole signup.' : 'Pick up the streak where you left it.'}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            {isSignup && (
              <Field
                label="Name"
                name="name"
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={values.name}
                onChange={set('name')}
                error={fieldErrors.name}
                required
              />
            )}

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
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={values.password}
              onChange={set('password')}
              error={fieldErrors.password}
              hint={isSignup ? 'At least 8 characters.' : undefined}
              required
            />

            {formError && !Object.keys(fieldErrors).length && (
              <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              {isSignup ? 'Create account' : 'Sign in'}
              {!submitting && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-dim">
            {isSignup ? 'Already have an account?' : 'New here?'}{' '}
            <Link
              to={isSignup ? '/login' : '/signup'}
              className="font-medium text-brand-pale underline-offset-4 hover:underline"
            >
              {isSignup ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
