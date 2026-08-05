import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-8 place-items-center rounded-lg border border-line bg-card">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b7bff" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            d="M11 10.5 6.5 16 11 21.5M21 10.5 25.5 16 21 21.5"
            fill="none"
            stroke="url(#logo-gradient)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M18 8.5 14 23.5" fill="none" stroke="#e7e7ee" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Optimus<span className="text-ink-dim"> Code</span>
        </span>
      )}
    </Link>
  );
}
