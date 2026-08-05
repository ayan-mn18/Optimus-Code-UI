import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { TodayPanel } from '@/components/dashboard/TodayPanel';
import { StatTiles } from '@/components/dashboard/StatTiles';
import { Heatmap } from '@/components/charts/Heatmap';
import { TopicMastery } from '@/components/charts/TopicMastery';
import { DifficultySplit } from '@/components/charts/DifficultySplit';
import { Card, Skeleton } from '@/components/ui/primitives';
import { useOverview, useToday } from '@/hooks/useChallenge';
import { useAuth } from '@/store/auth';

export function Dashboard() {
  const { user, enrollment } = useAuth();
  const today = useToday();
  const overview = useOverview();

  if (!enrollment) return <Navigate to="/onboarding" replace />;

  if (today.isError || overview.isError) {
    return (
      <Card className="flex items-start gap-3 border-bad/30">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-bad" />
        <div>
          <p className="text-sm font-medium text-ink">Could not load your challenge</p>
          <p className="mt-1 text-xs text-ink-dim">
            {(today.error ?? overview.error)?.message ?? 'The API did not respond.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <p className="text-xs uppercase tracking-wider text-ink-dim">Dashboard</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
      </div>

      {overview.data ? <StatTiles overview={overview.data} /> : <TilesSkeleton />}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {today.data ? <TodayPanel today={today.data} /> : <PanelSkeleton />}
          {overview.data && <Heatmap cells={overview.data.heatmap} target={today.data?.target ?? 5} />}
        </div>

        <div className="space-y-6">
          {overview.data && <DifficultySplit data={overview.data.difficulty} />}
          {overview.data && <TopicMastery topics={overview.data.topics} />}
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function TilesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="card space-y-2 p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-14" />
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <Card className="space-y-4">
      <Skeleton className="h-28 w-full" />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </Card>
  );
}
