import { Link } from 'react-router-dom';
import site from '@/config/site.json';

export function PublicFooter() {
  return (
    <footer className="relative border-t border-line px-5 py-7 text-xs text-ink-muted">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p>© {new Date().getFullYear()} {site.name} · {site.country}</p>
        <nav aria-label="Legal and support" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/privacy" className="inline-flex min-h-11 items-center hover:text-ink">Privacy</Link>
          <Link to="/terms" className="inline-flex min-h-11 items-center hover:text-ink">Terms</Link>
          <button type="button" onClick={() => window.dispatchEvent(new Event('oc:privacy-notice'))} className="min-h-11 hover:text-ink">Cookie preferences</button>
          <a href={`mailto:${site.supportEmail}`} className="inline-flex min-h-11 items-center hover:text-ink">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
