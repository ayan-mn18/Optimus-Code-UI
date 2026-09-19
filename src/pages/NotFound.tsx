import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { PublicFooter } from '@/components/layout/PublicFooter';

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto w-full max-w-6xl px-5 py-6"><Logo /></header>
      <main id="main-content" tabIndex={-1} className="mx-auto grid w-full max-w-2xl flex-1 place-content-center px-5 py-20 text-center">
        <p className="font-mono text-sm tracking-widest text-brand-pale">404 · PAGE NOT FOUND</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">This page took a wrong turn.</h1>
        <p className="mt-4 text-sm leading-7 text-ink-muted">The link may be outdated or the page may have moved. Your practice is still here.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex min-h-11 items-center rounded-xl bg-brand-deep px-5 text-sm font-medium text-white">Back to home</Link>
          <a href="mailto:info@optimusco.de" className="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-5 text-sm text-ink-muted hover:text-ink">Report a broken link</a>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
