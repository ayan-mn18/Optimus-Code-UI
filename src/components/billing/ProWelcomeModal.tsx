import { createPortal } from 'react-dom';
import { BrainCircuit, BookOpen, Check, Code2, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/primitives';

const ACCESS = [
  { icon: BrainCircuit, label: 'LLD practice', detail: 'Model objects and prove behavior.', to: '/system-design/lld' },
  { icon: Code2, label: 'HLD practice', detail: 'Map systems and defend trade-offs.', to: '/system-design/hld' },
  { icon: BookOpen, label: 'Design blogs', detail: 'Read evidence-backed write-ups.', to: '/blogs' },
];

export function ProWelcomeModal({ onDismiss }: { onDismiss: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-canvas/85 p-4 backdrop-blur-xl sm:p-6">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-welcome-title"
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-brand/30 bg-card shadow-[0_32px_120px_-30px_rgba(124,92,255,0.65)]"
        >
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_18%_0%,rgba(124,92,255,0.3),transparent_56%),radial-gradient(circle_at_88%_0%,rgba(34,211,238,0.18),transparent_48%)]" />
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close Pro welcome message"
            className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full text-ink-dim transition-colors hover:bg-elevated hover:text-ink"
          >
            <X className="size-5" />
          </button>

          <div className="relative px-5 pb-6 pt-10 sm:px-10 sm:pb-9 sm:pt-14">
            <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-brand/35 bg-brand/15 text-brand-pale shadow-[0_0_70px_rgba(124,92,255,0.38)]">
              <Sparkles className="size-10" />
            </div>
            <p className="mt-7 text-center text-xs font-medium uppercase tracking-[0.28em] text-brand-pale">Optimus Pro unlocked</p>
            <h1 id="pro-welcome-title" className="mt-3 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              Your design workspace is open.
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-ink-muted">
              You can now access LLD, HLD, and the Optimus design-blog library. Pick a track and start with one focused session.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {ACCESS.map(({ icon: Icon, label, detail, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onDismiss}
                  className="group rounded-2xl border border-line bg-surface/60 p-4 transition-colors hover:border-brand/45 hover:bg-brand/[0.08]"
                >
                  <span className="grid size-9 place-items-center rounded-xl border border-brand/25 bg-brand/10 text-brand-pale">
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-ink group-hover:text-brand-pale">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-dim">{detail}</p>
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-5 sm:flex-row">
              <p className="flex items-center gap-2 text-xs text-good"><Check className="size-4" /> Pro access is active on your account.</p>
              <Button onClick={onDismiss} icon={<Check className="size-4" />}>Start practicing</Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
