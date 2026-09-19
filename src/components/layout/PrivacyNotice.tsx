import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NOTICE_KEY = 'oc.essential-storage-notice.v1';

// This is an essential-storage notice, not consent to optional tracking.
// Analytics and advertising are deliberately not installed.
export function PrivacyNotice() {
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(NOTICE_KEY) !== 'acknowledged'; }
    catch { return true; }
  });

  useEffect(() => {
    const reopen = () => {
      setOpen(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('oc:privacy-notice', reopen);
    return () => window.removeEventListener('oc:privacy-notice', reopen);
  }, []);

  if (!open) return null;

  return (
    <aside aria-label="Cookie and storage preferences" className="relative z-30 border-b border-line-strong bg-surface px-5 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl text-xs leading-relaxed text-ink-muted">
          <p className="font-medium text-ink">Essential storage only.</p>
          <p className="mt-1">We store your sign-in session and preferences in your browser. No optional analytics or advertising tracking is enabled. <Link to="/privacy" className="text-brand-pale underline underline-offset-4">Read our privacy policy</Link>.</p>
        </div>
        <button type="button" onClick={() => {
          try { localStorage.setItem(NOTICE_KEY, 'acknowledged'); } catch { /* Storage may be blocked. */ }
          setOpen(false);
        }} className="min-h-11 shrink-0 rounded-xl border border-line-strong bg-elevated px-5 text-sm font-medium text-ink hover:border-brand">Got it</button>
      </div>
    </aside>
  );
}
