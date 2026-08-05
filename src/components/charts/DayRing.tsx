import { motion } from 'framer-motion';
import { INK, RAMP, STATUS } from './viz';

/**
 * The day's headline: a single ratio, so it gets a hero number with a thin
 * progress arc rather than a chart. The arc is decoration for the number, not
 * the other way round.
 */
export function DayRing({
  solved,
  target,
  size = 148,
  isComplete,
}: {
  solved: number;
  target: number;
  size?: number;
  isComplete: boolean;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = target ? Math.min(solved / target, 1) : 0;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="day-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={RAMP[2]} />
            <stop offset="100%" stopColor={isComplete ? STATUS.complete : RAMP[4]} />
          </linearGradient>
        </defs>

        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={INK.grid} strokeWidth={stroke} />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#day-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div className="absolute grid place-items-center text-center">
        <p className="text-3xl font-semibold leading-none text-ink">
          {solved}
          <span className="text-lg text-ink-dim">/{target}</span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-dim">
          {isComplete ? 'Day cleared' : 'Solved today'}
        </p>
      </div>
    </div>
  );
}
