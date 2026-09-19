import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { PageMetadata } from '@/components/layout/PageMetadata';
import { PrivacyNotice } from '@/components/layout/PrivacyNotice';
import { Spinner } from '@/components/ui/primitives';
import { useAuth } from '@/store/auth';

const OptimusAssessment = lazy(() => import('@/pages/OptimusAssessment').then((module) => ({ default: module.OptimusAssessment })));
const AppShell = lazy(() => import('@/components/layout/AppShell').then((module) => ({ default: module.AppShell })));
const AuthPage = lazy(() => import('@/pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const InvitePage = lazy(() => import('@/pages/InvitePage').then((module) => ({ default: module.InvitePage })));
const Onboarding = lazy(() => import('@/pages/Onboarding').then((module) => ({ default: module.Onboarding })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Problems = lazy(() => import('@/pages/Problems').then((module) => ({ default: module.Problems })));
const SystemDesign = lazy(() => import('@/pages/SystemDesign').then((module) => ({ default: module.SystemDesign })));
const Blogs = lazy(() => import('@/pages/Blogs').then((module) => ({ default: module.Blogs })));
const BlogPost = lazy(() => import('@/pages/BlogPost').then((module) => ({ default: module.BlogPost })));
const BlogEditor = lazy(() => import('@/pages/BlogEditor').then((module) => ({ default: module.BlogEditor })));
const Recap = lazy(() => import('@/pages/Recap').then((module) => ({ default: module.Recap })));
const Leaderboard = lazy(() => import('@/pages/Leaderboard').then((module) => ({ default: module.Leaderboard })));
const Settings = lazy(() => import('@/pages/Settings').then((module) => ({ default: module.Settings })));
const Pricing = lazy(() => import('@/pages/Pricing').then((module) => ({ default: module.Pricing })));
const BillingSuccess = lazy(() => import('@/pages/Pricing').then((module) => ({ default: module.BillingSuccess })));
const Legal = lazy(() => import('@/pages/Legal').then((module) => ({ default: module.Legal })));
const NotFound = lazy(() => import('@/pages/NotFound').then((module) => ({ default: module.NotFound })));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();

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
    <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <PageMetadata />
    <PrivacyNotice />
    <Suspense fallback={<div role="status" className="grid min-h-[60vh] place-content-center gap-3 text-center text-sm text-ink-muted"><Spinner className="mx-auto size-6" /><span>Loading your page…</span></div>}>
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/privacy" element={<Legal kind="privacy" />} />
      <Route path="/terms" element={<Legal kind="terms" />} />

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
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/new" element={<BlogEditor />} />
        <Route path="/blogs/:slug" element={<BlogPost />} />
        <Route path="/blogs/:slug/edit" element={<BlogEditor />} />
        <Route path="/recap" element={<Recap />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/*
        Two ways into the same screen. `/optimus/new/:problemId` is what the
        catalogue links to: the exam chrome renders immediately and the attempt
        is created from inside it, so a click costs a route change rather than a
        round trip. It swaps itself for the real id as soon as one exists.
      */}
      {['/optimus/new/:problemId', '/optimus/:attemptId'].map((path) => (
        <Route
          key={path}
          path={path}
          element={
            <RequireAuth>
              <Suspense fallback={<div className="grid min-h-dvh place-items-center"><Spinner className="size-7" /></div>}>
                <OptimusAssessment />
              </Suspense>
            </RequireAuth>
          }
        />
      ))}

      <Route
        path="/billing/success"
        element={
          <RequireAuth>
            <BillingSuccess />
          </RequireAuth>
        }
      />

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </>
  );
}
