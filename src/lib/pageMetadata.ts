import site from '@/config/site.json';

const PRIVATE_PATHS = new Set(['/login', '/invite', '/onboarding', '/dashboard', '/dsa', '/blogs', '/recap', '/leaderboard', '/settings', '/billing/success']);

export function pageMetadata(pathname: string) {
  const path = pathname.replace(/\/$/, '') || '/';
  const page = site.pages.find((item) => item.path === path);
  if (page) return { ...page, indexable: true };
  const known = PRIVATE_PATHS.has(path) || /^\/(?:system-design\/(?:lld|hld)|blogs\/[^/]+(?:\/edit)?|optimus\/(?:new\/)?[^/]+)$/.test(path);
  return {
    path: '/', indexable: false,
    title: known ? 'Your practice — Optimus Code' : 'Page not found — Optimus Code',
    description: known ? 'Sign in to manage your practice, assessments, and account on Optimus Code.' : 'This page could not be found. Return to Optimus Code to continue your practice.',
  };
}
