import { LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/primitives';

export function ProLockCard({ title, body = 'Your DSA library stays free. Unlock the Optimus blog library, research write-ups, and publishing tools with Pro.' }: {
  title: string;
  body?: string;
}) {
  return (
    <Card className="border-brand/30 bg-brand/[0.06] p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-brand/30 bg-brand/10 text-brand-pale">
        <LockKeyhole className="size-5" />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>
      <Link to="/pricing" className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-strong to-brand px-5 text-sm font-medium text-white">
        View Pro plans
      </Link>
    </Card>
  );
}
