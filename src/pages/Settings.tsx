import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, Button, Field } from '@/components/ui/primitives';
import { useAuth } from '@/store/auth';
import { useUpdateGoals } from '@/hooks/useChallenge';
import { api } from '@/lib/api';
import { browserTimezone, formatDate } from '@/lib/utils';
import type { DailyGoals, ProblemKind } from '@/lib/types';

export function Settings() {
  const { user, enrollment, setUser } = useAuth();
  const updateGoals = useUpdateGoals();
  const subscription = useQuery({ queryKey: ['subscription'], queryFn: api.subscription });

  const [name, setName] = useState(user?.name ?? '');
  const [goals, setGoals] = useState<DailyGoals>({
    DSA: enrollment?.dsa_target ?? 3,
    LLD: enrollment?.lld_target ?? 1,
    HLD: enrollment?.hld_target ?? 1,
  });
  const [saved, setSaved] = useState<'profile' | 'goals' | 'leaderboard' | null>(null);
  const [saving, setSaving] = useState(false);

  const saveVisibility = async (showOnLeaderboard: boolean) => {
    const { user: updated } = await api.updateProfile({ showOnLeaderboard });
    setUser(updated);
    setSaved('leaderboard');
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { user: updated } = await api.updateProfile({ name, timezone: browserTimezone() });
      setUser(updated);
      setSaved('profile');
    } finally {
      setSaving(false);
    }
  };

  const saveGoals = async () => {
    await updateGoals.mutateAsync(goals);
    setSaved('goals');
  };

  const setGoal = (kind: ProblemKind, value: number) => {
    setGoals((current) => ({ ...current, [kind]: Math.max(0, Math.min(kind === 'DSA' ? 20 : 10, value)) }));
    setSaved(null);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-dim">Account</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader title="Profile" hint="Your timezone decides when a day rolls over." />
        <div className="space-y-4">
          <Field label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Field label="Email" value={user?.email ?? ''} disabled hint="Email cannot be changed." />
          <Field label="Timezone" value={user?.timezone ?? browserTimezone()} disabled hint={`Detected: ${browserTimezone()}`} />

          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} loading={saving}>
              Save profile
            </Button>
            {saved === 'profile' && <span className="text-xs text-good">Saved</span>}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Leaderboard"
          hint="Your name, streak and solved count appear on the public board."
        />
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface/50 px-4 py-3">
          <span className="text-sm text-ink-muted">
            Show me on the leaderboard
            <span className="mt-0.5 block text-xs text-ink-dim">
              Turn this off and you drop off the board — you still see your own standing.
            </span>
          </span>
          <input
            type="checkbox"
            checked={user?.showOnLeaderboard ?? true}
            onChange={(event) => saveVisibility(event.target.checked)}
            className="size-5 shrink-0 accent-[var(--color-brand)]"
          />
        </label>
        {saved === 'leaderboard' && <p className="mt-2 text-xs text-good">Saved</p>}
      </Card>

      <Card>
        <CardHeader title="Subscription" hint="Optimus Pro includes System Design assessments and coding exercises." />
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">{subscription.data?.subscription ? `${subscription.data.subscription.plan} plan` : 'No active plan'}</p>
            <p className="mt-1 text-xs capitalize text-ink-dim">{subscription.data?.subscription?.status ?? 'Choose monthly or annual billing.'}</p>
          </div>
          <Link to="/pricing" className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-elevated px-3 text-xs font-medium text-ink-muted hover:border-brand/50 hover:text-ink">
            View pricing
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Daily goals"
          hint={enrollment ? `Challenge started ${formatDate(enrollment.started_on)}` : undefined}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {(['DSA', 'LLD', 'HLD'] as ProblemKind[]).map((kind) => (
            <label key={kind} className="rounded-xl border border-line bg-surface/50 p-4">
              <span className="flex items-center justify-between gap-2 text-xs text-ink-muted">
                <span className="font-medium text-ink">{kind}</span>
                <span>{kind === 'DSA' ? 'Algorithms' : kind === 'LLD' ? 'Object design' : 'Architecture'}</span>
              </span>
              <input
                type="number"
                min={0}
                max={kind === 'DSA' ? 20 : 10}
                value={goals[kind]}
                onChange={(event) => setGoal(kind, Number(event.target.value))}
                className="mt-4 h-11 w-full rounded-xl border border-line bg-elevated px-3 text-center text-xl font-semibold"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={saveGoals} loading={updateGoals.isPending} disabled={goals.DSA + goals.LLD + goals.HLD < 1 || goals.DSA + goals.LLD + goals.HLD > 20}>
            Update goals
          </Button>
          <span className="text-xs text-ink-dim">{goals.DSA + goals.LLD + goals.HLD} total each day</span>
          {saved === 'goals' && <span className="text-xs text-good">Updated</span>}
        </div>

        <p className="mt-3 text-[11px] text-ink-dim">
          Changes apply next day. Today&rsquo;s assigned mix stays unchanged.
        </p>
      </Card>
    </div>
  );
}
