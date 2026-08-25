import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button, Card, Field, Spinner } from '@/components/ui/primitives';
import { api, ApiError } from '@/lib/api';
import { browserTimezone } from '@/lib/utils';

export function InvitePage() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '');
  const [invite, setInvite] = useState<{ email: string; expiresAt: string } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'creating' | 'created' | 'invalid'>('loading');
  const [values, setValues] = useState({ name: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    let cancelled = false;
    api
      .inspectInvite(token)
      .then((result) => {
        if (cancelled) return;
        setInvite(result);
        setStatus('ready');
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : 'Invite is invalid or expired');
        setStatus('invalid');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (values.password !== values.confirm) {
      setFieldErrors({ confirm: 'Passwords do not match' });
      return;
    }

    setStatus('creating');
    try {
      await api.acceptInvite(token, {
        name: values.name,
        password: values.password,
        timezone: browserTimezone(),
      });
      setStatus('created');
    } catch (reason) {
      if (reason instanceof ApiError && reason.details?.length) {
        setFieldErrors(Object.fromEntries(reason.details.map((detail) => [detail.field, detail.message])));
      }
      setError(reason instanceof Error ? reason.message : 'Could not create your account');
      setStatus('ready');
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute -left-32 top-0 size-[30rem] rounded-full bg-brand-strong/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[28rem] rounded-full bg-accent/10 blur-[130px]" />

      <div className="relative z-10 w-full max-w-md">
        <Logo className="mb-8 justify-center" />

        {status === 'loading' && (
          <Card className="grid min-h-64 place-items-center">
            <div className="text-center">
              <Spinner className="mx-auto size-6" />
              <p className="mt-3 text-sm text-ink-muted">Checking your secure invitation…</p>
            </div>
          </Card>
        )}

        {status === 'invalid' && (
          <Card className="border-bad/25 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-bad/10 text-bad">
              <ShieldCheck className="size-6" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold">This invite cannot be used.</h1>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {error || 'The link is invalid, expired, or already used.'}
            </p>
            <Link to="/" className="mt-6 inline-flex text-sm font-medium text-brand-pale hover:underline">
              Return home
            </Link>
          </Card>
        )}

        {(status === 'ready' || status === 'creating') && invite && (
          <Card className="p-6 sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand-pale">
              <Mail className="size-6" />
            </span>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-brand-pale">Private invitation</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your Optimus Code account</h1>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Invited as <span className="font-medium text-ink">{invite.email}</span>. Choose a private password.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
              <Field
                label="Name"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                value={values.name}
                onChange={set('name')}
                error={fieldErrors.name}
                required
              />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={values.password}
                onChange={set('password')}
                error={fieldErrors.password}
                hint="Never shared by email."
                required
              />
              <Field
                label="Confirm password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={values.confirm}
                onChange={set('confirm')}
                error={fieldErrors.confirm}
                required
              />

              {error && !Object.keys(fieldErrors).length && (
                <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" loading={status === 'creating'}>
                Create account <ArrowRight className="size-4" />
              </Button>
            </form>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-dim">
              <ShieldCheck className="size-3.5" /> One-time link. Password stays encrypted.
            </p>
          </Card>
        )}

        {status === 'created' && invite && (
          <Card className="border-good/25 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-good/10 text-good">
              <CheckCircle2 className="size-7" />
            </span>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-good">Account ready</p>
            <h1 className="mt-2 text-2xl font-semibold">Welcome to Optimus Code.</h1>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Sign in using <span className="font-medium text-ink">{invite.email}</span> and the password you chose.
            </p>
            <Link
              to={`/login?email=${encodeURIComponent(invite.email)}`}
              className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-brand-strong to-brand px-6 text-sm font-medium text-white hover:brightness-110"
            >
              Sign in <ArrowRight className="size-4" />
            </Link>
          </Card>
        )}
      </div>
    </main>
  );
}
