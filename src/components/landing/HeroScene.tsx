import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Check, Flame } from 'lucide-react';
import { RAMP } from '@/components/charts/viz';

const TODAY = [
  { title: 'Longest Consecutive Sequence', topic: 'Arrays', level: 'Medium', done: true },
  { title: 'Number of Islands', topic: 'Graphs', level: 'Medium', done: true },
  { title: 'Word Break', topic: 'Dynamic Programming', level: 'Hard', done: true },
  { title: 'LRU Cache', topic: 'Linked List', level: 'Hard', done: false },
  { title: 'Implement Trie', topic: 'Trie', level: 'Medium', done: false },
];

/**
 * 26 weeks of plausible-looking activity for the floating heatmap card: a slow
 * ramp as the habit builds, quiet gaps early on, and a few red days scattered
 * through the middle. Deterministic, so the hero renders identically every load.
 */
const HEAT = Array.from({ length: 26 * 7 }, (_, i) => {
  const ramp = i / (26 * 7);
  const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  const idle = Math.abs(noise) > 0.35 + ramp * 0.5;

  if (idle) return 0;
  if (i > 60 && i % 29 === 0) return -1; // red days once the streak is running
  return Math.max(1, Math.min(4, Math.round(1 + ramp * 3 + Math.abs(noise) * 1.5)));
});

/**
 * The hero's 3D scene: three cards floating at different depths inside a shared
 * perspective, parallaxed by pointer position. Layers further from the viewer
 * move less, which is what sells the depth.
 */
export function HeroScene({
  rotateX,
  rotateY,
  offsetX,
  offsetY,
}: {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
}) {
  // Parallax amount per layer — nearer layers travel further.
  const near = {
    x: useTransform(offsetX, [-0.5, 0.5], [-26, 26]),
    y: useTransform(offsetY, [-0.5, 0.5], [-16, 16]),
  };
  const mid = {
    x: useTransform(offsetX, [-0.5, 0.5], [-14, 14]),
    y: useTransform(offsetY, [-0.5, 0.5], [-8, 8]),
  };
  const far = {
    x: useTransform(offsetX, [-0.5, 0.5], [-7, 7]),
    y: useTransform(offsetY, [-0.5, 0.5], [-4, 4]),
  };

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[540px]"
      style={{ perspective: 1400 }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <motion.div
        className="relative h-[420px] w-full"
        style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
      >
        {/* --- back: consistency heatmap ---------------------------------- */}
        <motion.div
          className="absolute left-0 top-0 w-[340px] rounded-2xl border border-line bg-card/90 p-4 backdrop-blur-xl"
          style={{ ...far, transform: 'translateZ(-70px) rotateZ(-3deg)', boxShadow: '0 40px 80px -40px #000' }}
        >
          <p className="mb-3 text-[11px] uppercase tracking-wider text-ink-dim">Consistency</p>
          <div className="flex gap-[3px]">
            {Array.from({ length: 26 }, (_, week) => (
              <div key={week} className="flex flex-col gap-[3px]">
                {HEAT.slice(week * 7, week * 7 + 7).map((value, day) => (
                  <span
                    key={day}
                    className="size-[9px] rounded-[2px]"
                    style={{
                      background: value <= 0 ? '#191922' : RAMP[Math.min(value, 4)],
                      boxShadow: value === -1 ? '0 0 0 1.5px #f4696b99' : undefined,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* --- front: today's set ----------------------------------------- */}
        <motion.div
          className="absolute right-0 top-[86px] w-[360px] rounded-2xl border border-line bg-card/95 p-4 backdrop-blur-xl"
          style={{ ...near, transform: 'translateZ(70px) rotateZ(2deg)', boxShadow: '0 60px 100px -40px #000' }}
        >
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-wider text-ink-dim">Today</p>
            <p className="text-[11px] tabular-nums text-ink-muted">3 / 5</p>
          </div>

          <ul className="space-y-1.5">
            {TODAY.map((problem, index) => (
              <motion.li
                key={problem.title}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
                className="flex items-center gap-2.5 rounded-lg border border-line/70 bg-surface/70 px-2.5 py-2"
              >
                <span
                  className={
                    problem.done
                      ? 'grid size-4 place-items-center rounded border border-good bg-good text-canvas'
                      : 'size-4 rounded border border-line-strong'
                  }
                >
                  {problem.done && <Check className="size-2.5" strokeWidth={4} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-[12px] ${problem.done ? 'text-ink-dim line-through' : 'text-ink'}`}
                  >
                    {problem.title}
                  </span>
                  <span className="text-[10px] text-ink-dim">{problem.topic}</span>
                </span>
                <span className="shrink-0 text-[10px] text-ink-dim">{problem.level}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* --- floating streak chip --------------------------------------- */}
        <motion.div
          className="absolute left-[26px] top-[300px] rounded-xl border border-line bg-elevated/95 px-3.5 py-2.5 backdrop-blur-xl"
          style={{ ...mid, transform: 'translateZ(120px) rotateZ(-4deg)', boxShadow: '0 40px 70px -30px #000' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-dim">
            <Flame className="size-3 text-warn" /> Streak
          </p>
          <p className="mt-0.5 text-xl font-semibold leading-none">
            42 <span className="text-xs font-normal text-ink-dim">days</span>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
