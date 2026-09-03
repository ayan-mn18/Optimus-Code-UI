import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthPage } from '@/pages/AuthPage';
import { Landing } from '@/pages/Landing';
import { InvitePage } from '@/pages/InvitePage';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { Problems } from '@/pages/Problems';
import { SystemDesign } from '@/pages/SystemDesign';
import { Recap } from '@/pages/Recap';
import { Leaderboard } from '@/pages/Leaderboard';
import { Settings } from '@/pages/Settings';
import { BillingSuccess, Pricing } from '@/pages/Pricing';
import { Spinner } from '@/components/ui/primitives';
import { useAuth } from '@/store/auth';

const OptimusAssessment = lazy(() => import('@/pages/OptimusAssessment').then((module) => ({ default: module.OptimusAssessment })));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/pricing" element={<Pricing />} />

      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <Onboarding />
          </RequireAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dsa" element={<Problems />} />
        <Route path="/system-design/:kind" element={<SystemDesign />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route
        path="/optimus/:attemptId"
        element={
          <RequireAuth>
            <Suspense fallback={<div className="grid min-h-dvh place-items-center"><Spinner className="size-7" /></div>}>
              <OptimusAssessment />
            </Suspense>
          </RequireAuth>
        }
      />

      <Route
        path="/billing/success"
        element={
          <RequireAuth>
            <BillingSuccess />
          </RequireAuth>
        }
      />

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
