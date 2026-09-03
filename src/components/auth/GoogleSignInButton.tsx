import { useEffect, useRef, useState } from 'react';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccounts {
  id: {
    initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select: boolean }) => void;
    renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
    cancel: () => void;
  };
}

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

let googleScript: Promise<void> | null = null;

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none">
      <path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.37-.18-2.02H12v3.83h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.2Z" />
      <path fill="#34A853" d="M12 21.6c2.64 0 4.85-.87 6.46-2.35l-3.14-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.7-1.72-5.47-4.03H3.28v2.53A9.76 9.76 0 0 0 12 21.6Z" />
      <path fill="#FBBC05" d="M6.53 13.69a5.86 5.86 0 0 1 0-3.38V7.78H3.28a9.6 9.6 0 0 0 0 8.44l3.25-2.53Z" />
      <path fill="#EA4335" d="M12 6.28c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.85 3.4 14.64 2.4 12 2.4a9.76 9.76 0 0 0-8.72 5.38l3.25 2.53C7.3 8 9.45 6.28 12 6.28Z" />
    </svg>
  );
}

function loadGoogleIdentity() {
  if (window.google?.accounts) return Promise.resolve();
  if (googleScript) return googleScript;
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  googleScript = promise;
  const existing = document.querySelector<HTMLScriptElement>('script[data-optimus-google]');
  if (existing) {
    existing.addEventListener('load', () => resolve(), { once: true });
    existing.addEventListener('error', () => reject(new Error('Google sign-in failed to load')), { once: true });
    return googleScript;
  }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.dataset.optimusGoogle = 'true';
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Google sign-in failed to load'));
  document.head.appendChild(script);

  return googleScript;
}

export function GoogleSignInButton({ onCredential }: { onCredential: (credential: string) => Promise<void> }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!clientId || !container.current) return;
    let cancelled = false;
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !container.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          callback: ({ credential }) => {
            setError('');
            onCredential(credential).catch((reason) => {
              setError(reason instanceof Error ? reason.message : 'Google sign-in failed');
            });
          },
        });
        window.google.accounts.id.renderButton(container.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: '100%',
        });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Google sign-in failed'));
    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [clientId, onCredential]);

  if (!clientId) {
    return <p className="rounded-xl border border-line bg-surface/60 px-3 py-2 text-center text-xs text-ink-dim">Google sign-in activates after adding the client ID.</p>;
  }

  return (
    <div>
      <div className="group relative h-12 w-full rounded-xl bg-gradient-to-r from-brand-strong via-brand to-accent p-px shadow-[0_14px_34px_-22px_rgba(124,92,255,0.95)] transition-shadow duration-200 hover:shadow-[0_18px_40px_-18px_rgba(124,92,255,0.95)]">
        <div className="pointer-events-none flex h-full items-center justify-center gap-3 rounded-[11px] border border-white/10 bg-elevated px-4 text-sm font-medium text-ink transition-colors group-hover:bg-card">
          <GoogleMark />
          <span>Continue with Google</span>
        </div>
        <div
          ref={container}
          aria-label="Continue with Google"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 [&>iframe]:!h-full [&>iframe]:!w-full"
        />
      </div>
      {error && <p role="alert" className="mt-2 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-center text-xs text-bad">{error}</p>}
    </div>
  );
}
