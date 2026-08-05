import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * The mark: a streak ring broken open at the top-right, with a bolt through the
 * middle. The ring is the daily habit, the gap is the day still to be closed,
 * the bolt is the momentum — the three things the product is actually about.
 * Drawn as one glyph so it survives being shrunk to a favicon.
 */
export function LogoMark({ className, id = 'mark' }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="45%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${id}-bolt`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d9d9ff" />
        </linearGradient>
      </defs>

      {/* streak ring, open at the top-right */}
      <circle
        cx="20"
        cy="20"
        r="14.5"
        fill="none"
        stroke={`url(#${id}-ring)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="70 21"
        transform="rotate(-58 20 20)"
      />

      {/* the day still open */}
      <circle cx="31.2" cy="10.4" r="3.1" fill="#22d3ee" />

      {/* bolt */}
      <path
        d="M22.4 10.5 13.2 21.4h5.1l-1.7 8.1 9.2-10.9h-5.1z"
        fill={`url(#${id}-bolt)`}
        stroke="#08080b"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <LogoMark className="size-9 transition-transform duration-300 group-hover:scale-105" />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Optimus<span className="text-ink-dim"> Code</span>
        </span>
      )}
    </Link>
  );
}
