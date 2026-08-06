import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthPage } from '@/pages/AuthPage';
import { Landing } from '@/pages/Landing';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { Problems } from '@/pages/Problems';
import { Recap } from '@/pages/Recap';
import { Leaderboard } from '@/pages/Leaderboard';
import { Settings } from '@/pages/Settings';
import { Spinner } from '@/components/ui/primitives';
import { useAuth } from '@/store/auth';

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
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />

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
        <Route path="/problems" element={<Problems />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
