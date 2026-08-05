import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Difficulty } from '@/lib/types';

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'subtle' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-linear-to-br from-brand-strong to-brand shadow-[0_8px_24px_-12px] shadow-brand-strong/80 hover:brightness-110 active:brightness-95',
  outline: 'border border-line-strong bg-elevated/60 text-ink hover:bg-elevated hover:border-brand/50',
  ghost: 'text-ink-muted hover:text-ink hover:bg-elevated/70',
  subtle: 'bg-elevated text-ink-muted hover:text-ink',
  danger: 'border border-bad/40 text-bad hover:bg-bad/10',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-ink">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-ink-dim">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Difficulty badge — the word is always present, so difficulty never rides    */
/* on color alone.                                                             */
/* -------------------------------------------------------------------------- */

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: 'text-good border-good/30 bg-good/10',
  Medium: 'text-warn border-warn/30 bg-warn/10',
  Hard: 'text-bad border-bad/30 bg-bad/10',
};

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
        DIFFICULTY_STYLES[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-line bg-elevated/70 px-1.5 py-0.5 text-[11px] text-ink-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                       */
/* -------------------------------------------------------------------------- */

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-xs font-medium text-ink-muted">
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={cn(
          'h-11 w-full rounded-xl border border-line bg-surface/80 px-3.5 text-sm text-ink transition-colors',
          'placeholder:text-ink-dim hover:border-line-strong focus:border-brand/70 focus:outline-none',
          error && 'border-bad/60',
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-bad">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-dim">{hint}</p>
      )}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Misc                                                                        */
/* -------------------------------------------------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand', className)} aria-label="Loading" />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />;
}

export function EmptyState({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {icon && <div className="text-ink-dim">{icon}</div>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {body && <p className="max-w-sm text-xs text-ink-dim">{body}</p>}
    </div>
  );
}
