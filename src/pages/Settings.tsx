import { useState } from 'react';
import { Card, CardHeader, Button, Field } from '@/components/ui/primitives';
import { useAuth } from '@/store/auth';
import { useEnroll } from '@/hooks/useChallenge';
import { api } from '@/lib/api';
import { browserTimezone, formatDate } from '@/lib/utils';

export function Settings() {
  const { user, enrollment, setUser } = useAuth();
  const enroll = useEnroll();

  const [name, setName] = useState(user?.name ?? '');
  const [target, setTarget] = useState(enrollment?.daily_target ?? 5);
  const [saved, setSaved] = useState<'profile' | 'target' | null>(null);
  const [saving, setSaving] = useState(false);

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

  const saveTarget = async () => {
    await enroll.mutateAsync(target);
    setSaved('target');
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
          title="Daily target"
          hint={enrollment ? `Challenge started ${formatDate(enrollment.started_on)}` : undefined}
        />

        <div className="flex flex-wrap items-end gap-4">
          <label className="flex-1">
            <span className="mb-2 block text-xs text-ink-muted">
              Problems per day: <span className="font-medium text-ink">{target}</span>
            </span>
            <input
              type="range"
              min={1}
              max={12}
              value={target}
              onChange={(event) => setTarget(Number(event.target.value))}
              className="w-full accent-[var(--color-brand)]"
            />
          </label>

          <Button variant="outline" onClick={saveTarget} loading={enroll.isPending}>
            Update target
          </Button>
          {saved === 'target' && <span className="text-xs text-good">Updated</span>}
        </div>

        <p className="mt-3 text-[11px] text-ink-dim">
          Changing the target applies from your next day — today&rsquo;s set stays as it was handed out.
        </p>
      </Card>
    </div>
  );
}
