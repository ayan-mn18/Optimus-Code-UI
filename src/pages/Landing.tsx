import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, RotateCcw, Shuffle, Youtube, ExternalLink, Layers } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { HeroScene } from '@/components/landing/HeroScene';
import { WaitlistForm } from '@/components/landing/WaitlistForm';
import { TiltCard } from '@/components/landing/TiltCard';
import { useTilt } from '@/components/landing/useTilt';
import { useAuth } from '@/store/auth';
import { SIGNUP_ENABLED } from '@/lib/features';

const STATS = [
  { value: '544', label: 'problems' },
  { value: '19', label: 'topics' },
  { value: '5', label: 'a day' },
  { value: '2', label: 'Striver sheets' },
];

const STEPS = [
  {
    icon: Shuffle,
    title: 'Five land every morning',
    body: 'One problem per topic, weighted toward whatever you have touched least. Never five array questions in a row.',
  },
  {
    icon: CalendarDays,
    title: 'Clear them, the day goes green',
    body: 'Solve all five before midnight in your own timezone and the streak holds. Anything past five is bonus.',
  },
  {
    icon: RotateCcw,
    title: 'Miss one and it comes back',
    body: 'A short day is marked red and the problems you skipped drop back into the pool. Nothing quietly disappears.',
  },
];

const TOPICS = [
  'Arrays', 'Binary Search', 'Strings', 'Linked List', 'Recursion & Backtracking', 'Bit Manipulation',
  'Stack & Queue', 'Sliding Window & Two Pointer', 'Heaps', 'Greedy', 'Binary Tree', 'Binary Search Tree',
  'Graphs', 'Dynamic Programming', 'Trie', 'Sorting', 'Hashing', 'Math', 'Basics',
];

export function Landing() {
  const { user, ready } = useAuth();
  const scene = useTilt({ maxTilt: 9 });

  if (ready && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* ---- ambient depth ------------------------------------------------ */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 size-[38rem] rounded-full bg-brand-strong/20 blur-[140px] animate-[float_11s_ease-in-out_infinite]" />
        <div className="absolute -right-32 top-20 size-[30rem] rounded-full bg-accent/12 blur-[140px]" />
        <div
          className="absolute inset-x-0 bottom-0 h-[42vh] opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(to right, #2a2a3a 1px, transparent 1px), linear-gradient(to bottom, #2a2a3a 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            transform: 'perspective(520px) rotateX(62deg)',
            transformOrigin: 'bottom',
            maskImage: 'linear-gradient(to top, #000 5%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to top, #000 5%, transparent 85%)',
          }}
        />
      </div>

      {/* ---- nav ----------------------------------------------------------- */}
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          {SIGNUP_ENABLED && (
            <Link
              to="/signup"
              className="rounded-xl border border-line-strong bg-elevated/60 px-4 py-2 text-sm transition-colors hover:border-brand/50"
            >
              Get started
            </Link>
          )}
        </nav>
      </header>

      {/* ---- hero ---------------------------------------------------------- */}
      <section
        className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16"
        onPointerMove={scene.onPointerMove}
        onPointerLeave={scene.onPointerLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1 text-xs text-ink-muted backdrop-blur">
            <Layers className="size-3.5 text-brand" />
            Striver SDE + A2Z, merged and deduped
          </span>

          <h1 className="mt-5 text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.06] tracking-tight">
            Five problems.
            <br />
            Every single day.
            <br />
            <span className="gradient-text">No sheet left half-done.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Optimus Code deals you five DSA problems each morning — one per topic — and keeps score. Clear them
            and the day turns green. Skip them and they come back around. The sheet finishes itself.
          </p>

          <div className="mt-8 max-w-lg">
            <WaitlistForm />
          </div>

          {SIGNUP_ENABLED && (
            <div className="mt-8 flex items-center gap-3 text-sm">
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 text-brand-pale underline-offset-4 hover:underline"
              >
                Or start solving now <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </motion.div>

        <HeroScene
          rotateX={scene.rotateX}
          rotateY={scene.rotateY}
          offsetX={scene.offsetX}
          offsetY={scene.offsetY}
        />
      </section>

      {/* ---- stat band ------------------------------------------------------ */}
      <section className="relative mx-auto w-full max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              className="bg-card/80 px-5 py-6 text-center backdrop-blur"
            >
              <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-dim">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- how it works --------------------------------------------------- */}
      <section className="relative mx-auto w-full max-w-6xl px-5 py-24">
        <h2 className="max-w-xl text-3xl font-semibold tracking-tight">
          Consistency you don&rsquo;t have to <span className="gradient-text">think about</span>
        </h2>
        <p className="mt-3 max-w-lg text-sm text-ink-muted">
          No planning, no picking, no guilt spiral when you fall behind. The queue handles it.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-line bg-elevated text-brand">
                    <step.icon className="size-4" />
                  </span>
                  <span className="text-xs tabular-nums text-ink-dim">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-medium">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-dim">{step.body}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- coverage -------------------------------------------------------- */}
      <section className="relative mx-auto w-full max-w-6xl px-5 pb-24">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Everything, already linked up</h2>
              <p className="mt-2 max-w-lg text-sm text-ink-muted">
                Both Striver sheets in one catalogue — 307 problems carry a LeetCode link and 452 carry the
                walkthrough video, so you are one click from solving instead of searching.
              </p>
            </div>
            <div className="flex gap-4 text-xs text-ink-dim">
              <span className="inline-flex items-center gap-1.5">
                <ExternalLink className="size-3.5" /> LeetCode
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Youtube className="size-3.5" /> Walkthrough
              </span>
            </div>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {TOPICS.map((topic, index) => (
              <motion.li
                key={topic}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index * 0.025, 0.4), duration: 0.35 }}
                className="rounded-lg border border-line bg-surface/70 px-2.5 py-1.5 text-xs text-ink-muted"
              >
                {topic}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- closing CTA ------------------------------------------------------ */}
      <section className="relative mx-auto w-full max-w-3xl px-5 pb-28 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start the streak <span className="gradient-text">tomorrow morning</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          Join the waitlist and we&rsquo;ll open your seat with the first five waiting.
        </p>
        <div className="mx-auto mt-7 max-w-md">
          <WaitlistForm compact />
        </div>
      </section>

      <footer className="relative border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-ink-dim sm:flex-row">
          <Logo compact />
          <p>
            Problem sets from{' '}
            <a
              href="https://takeuforward.org"
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-muted underline-offset-4 hover:underline"
            >
              takeuforward.org
            </a>
          </p>
          <p>© {new Date().getFullYear()} Optimus Code</p>
        </div>
      </footer>
    </div>
  );
}
