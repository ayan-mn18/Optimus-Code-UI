import { useState } from 'react';
import { Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui/primitives';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';

const FEATURES = [
  'Daily DSA, LLD, and HLD assignments',
  'Complete System Design catalog',
  'Ten-question Optimus assessments',
  'LLD coding tasks with hidden tests',
  'Streaks, recaps, and progress analytics',
];

export function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const [error, setError] = useState('');

  const checkout = async (plan: 'monthly' | 'annual') => {
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    setLoading(plan);
    setError('');
    try {
      const { checkoutUrl } = await api.createCheckout(plan);
      window.location.assign(checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Checkout could not start');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-dvh px-5 pb-20">
      <header className="mx-auto flex max-w-6xl items-center justify-between py-6">
        <Logo />
        <Link to={user ? '/dashboard' : '/login'} className="rounded-xl border border-line bg-card/70 px-4 py-2 text-sm text-ink-muted hover:text-ink">
          {user ? 'Dashboard' : 'Sign in'}
        </Link>
      </header>

      <main className="mx-auto max-w-5xl pt-12 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-brand-pale">Simple pricing</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Practice every track.<br /><span className="gradient-text">Prove every solution.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-ink-muted">One Optimus plan includes DSA, System Design assessments, coding exercises, and progress tracking.</p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          <PlanCard title="Monthly" price="$10" suffix="per month" loading={loading === 'monthly'} onChoose={() => checkout('monthly')} />
          <PlanCard title="Annual" price="$80" suffix="per year" badge="Save $40 yearly" featured loading={loading === 'annual'} onChoose={() => checkout('annual')} />
        </div>

        {error && <p role="alert" className="mx-auto mt-5 max-w-xl rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}

        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-xs text-ink-dim">
          <ShieldCheck className="size-4 text-good" /> Secure hosted checkout through Dodo Payments. Taxes display before payment.
        </div>
      </main>
    </div>
  );
}

function PlanCard({ title, price, suffix, badge, featured, loading, onChoose }: {
  title: string;
  price: string;
  suffix: string;
  badge?: string;
  featured?: boolean;
  loading: boolean;
  onChoose: () => void;
}) {
  return (
    <Card className={featured ? 'relative border-brand/40 bg-brand/[0.06] p-6 text-left' : 'p-6 text-left'}>
      {badge && <span className="absolute right-5 top-5 rounded-full border border-good/30 bg-good/10 px-2.5 py-1 text-[10px] font-medium text-good">{badge}</span>}
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <div className="mt-3 flex items-end gap-2"><span className="text-4xl font-semibold tracking-tight">{price}</span><span className="pb-1 text-xs text-ink-dim">{suffix}</span></div>
      <ul className="mt-6 space-y-3">
        {FEATURES.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted"><Check className="mt-0.5 size-4 shrink-0 text-good" />{feature}</li>)}
      </ul>
      <Button className="mt-7 w-full" size="lg" loading={loading} onClick={onChoose} icon={<Sparkles className="size-4" />}>Choose {title.toLowerCase()}</Button>
    </Card>
  );
}

export function BillingSuccess() {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <Card className="max-w-lg text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-good/30 bg-good/10 text-good"><Check className="size-6" /></span>
        <h1 className="mt-5 text-2xl font-semibold">Checkout complete</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">Dodo is confirming your subscription. Access updates automatically when the signed webhook arrives.</p>
        <Link to="/dashboard" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-strong to-brand px-5 text-sm font-medium text-white">Return to dashboard</Link>
      </Card>
    </div>
  );
}
