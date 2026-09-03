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
          shape: 'pill',
          text: 'continue_with',
          width: 360,
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
      <div ref={container} className="flex min-h-11 justify-center" />
      {error && <p role="alert" className="mt-2 text-center text-xs text-bad">{error}</p>}
    </div>
  );
}
