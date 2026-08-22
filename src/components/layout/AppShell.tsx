import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Settings, LogOut, Flame, Trophy, Share2, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { useToday } from '@/hooks/useChallenge';
import { useMarkMilestoneViewed, usePendingMilestone } from '@/hooks/useMilestone';
import { MilestoneModal } from '@/components/milestone/MilestoneModal';
import { Logo } from './Logo';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/problems', label: 'Problems', icon: ListChecks },
  { to: '/recap', label: 'Recap', icon: Share2 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: Settings },
];

/** The mobile bar has room for four; settings lives in the header there. */
const MOBILE_NAV = NAV.filter((item) => item.to !== '/settings');

export function AppShell() {
  const { user, logout } = useAuth();
  const { data: today } = useToday();
  const navigate = useNavigate();
  const { data: milestone } = usePendingMilestone();
  const markMilestoneViewed = useMarkMilestoneViewed();

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {milestone && (
        <MilestoneModal
          recap={milestone}
          onDismiss={() => markMilestoneViewed.mutateAsync(milestone.milestone)}
        />
      )}
    <div className="mx-auto flex min-h-dvh w-full max-w-[1400px]">
      {/* ---- sidebar (desktop) -------------------------------------------- */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
        <Logo className="px-2" />

        <nav className="mt-8 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-elevated text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'text-ink-muted hover:bg-elevated/60 hover:text-ink',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {today && (
          <div className="mt-6 rounded-xl border border-line bg-card/60 p-3">
            <p className="flex items-center gap-1.5 text-xs text-ink-dim">
              <Flame className="size-3.5 text-warn" /> Streak
            </p>
            <p className="mt-1 text-xl font-semibold text-ink">
              {today.streak.current}
              <span className="ml-1 text-sm font-normal text-ink-dim">
                {today.streak.current === 1 ? 'day' : 'days'}
              </span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand-strong to-accent transition-[width] duration-500"
                style={{ width: `${Math.min((today.solvedCount / today.target) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-dim">
              {today.solvedCount}/{today.target} solved today
            </p>

            {today.streak.freezes.available > 0 && (
              <p
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent"
                title={`A freeze is spent automatically if you fall short of the target. Next one at ${today.streak.freezes.nextAt} green days.`}
              >
                <Snowflake className="size-3" />
                {today.streak.freezes.available} freeze
                {today.streak.freezes.available === 1 ? '' : 's'} banked
              </p>
            )}
          </div>
        )}

        <div className="mt-auto space-y-2 pt-6">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <Avatar name={user?.name ?? '?'} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
              <p className="truncate text-[11px] text-ink-dim">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-dim transition-colors hover:bg-elevated/60 hover:text-bad"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ---- content ------------------------------------------------------ */}
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
          <Logo compact />
          <div className="flex items-center gap-3">
            {today && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-2 py-1 text-xs">
                <Flame className="size-3.5 text-warn" />
                <span className="tabular-nums">{today.streak.current}</span>
              </span>
            )}
            <Avatar name={user?.name ?? '?'} />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      {/* ---- bottom nav (mobile) ------------------------------------------ */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-3 text-[11px] transition-colors',
                isActive ? 'text-brand' : 'text-ink-dim',
              )
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
    </>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-strong to-accent text-xs font-semibold text-canvas"
    >
      {initials}
    </span>
  );
}
