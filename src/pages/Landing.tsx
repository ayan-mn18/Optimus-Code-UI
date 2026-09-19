import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, RotateCcw, Shuffle, Youtube, ExternalLink } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { HeroScene } from '@/components/landing/HeroScene';
import { TiltCard } from '@/components/landing/TiltCard';
import { useTilt } from '@/components/landing/useTilt';
import { useAuth } from '@/store/auth';

const STATS = [
  { value: '822', label: 'problems' },
  { value: '44', label: 'topics' },
  { value: '3', label: 'tracks' },
  { value: '10', label: 'Optimus questions' },
];

const STEPS = [
  {
    icon: Shuffle,
    title: 'Your mix lands every morning',
    body: 'Start with free DSA practice. Pro members can add LLD and HLD goals with assignments that favor unsolved topics and avoid repetition.',
  },
  {
    icon: CalendarDays,
    title: 'Prove System Design work',
    body: 'Optimus asks ten fresh questions. Pro LLD attempts can include coding with hidden tests.',
  },
  {
    icon: RotateCcw,
    title: 'Clear every category',
    body: 'The day turns green after each configured track is complete. Missed work returns later, while DSA remains free for every signed-in account.',
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
        </nav>
      </header>

      {/* ---- hero ---------------------------------------------------------- */}
      <section
        id="main-content"
        tabIndex={-1}
        className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-24 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16"
        onPointerMove={scene.onPointerMove}
        onPointerLeave={scene.onPointerLeave}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="mt-5 text-[clamp(2.1rem,4.4vw,3.4rem)] font-semibold leading-[1.06] tracking-tight">
            Daily practice for DSA.
            <br />
            LLD and HLD assessments.
            <br />
            <span className="gradient-text">Progress you can prove.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Sign in and work through the complete DSA library for free. When you are ready to test your system-design skills, Optimus Pro unlocks LLD and HLD assessments, focused ten-question tests, and coding exercises.
          </p>

          <Link to="/login" className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-linear-to-br from-brand-strong to-brand px-5 text-sm font-medium text-white shadow-[0_10px_30px_-12px] shadow-brand-strong/80 transition hover:brightness-110">
            Start practicing free
          </Link>

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
              <h2 className="text-2xl font-semibold tracking-tight">Everything, already organized</h2>
              <p className="mt-2 max-w-lg text-sm text-ink-muted">
                Explore 544 DSA problems plus 73 LLD and 205 HLD items, grouped by topic and difficulty with original learning resources attached.
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

      <section className="relative mx-auto w-full max-w-4xl px-5 pb-24">
        <div className="rounded-2xl border border-brand/25 bg-brand/[0.06] p-6 text-center sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-brand-pale">Optimus Pro</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">DSA is free. System Design is focused.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Unlock LLD and HLD for $10/month or $80/year. DoDo handles secure checkout, automatic renewals, invoices, and payment reminders.
          </p>
          <Link to="/pricing" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl border border-brand/40 px-5 text-sm font-medium text-brand-pale hover:bg-brand/10">
            Compare Pro plans
          </Link>
        </div>
      </section>

      {/* ---- closing CTA ------------------------------------------------------ */}
      <section className="relative mx-auto w-full max-w-3xl px-5 pb-28 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start the streak <span className="gradient-text">tomorrow morning</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          Sign in to start your first daily practice set.
        </p>
        <Link to="/login" className="mt-7 inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-strong to-brand px-5 text-sm font-medium text-white shadow-[0_10px_30px_-12px] shadow-brand-strong/80 transition hover:brightness-110">
          Start practicing free
        </Link>
      </section>

      <div className="relative border-t border-line">
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
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
