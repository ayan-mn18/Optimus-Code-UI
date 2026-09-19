import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Bug, CheckCircle2, ImagePlus, Paperclip, Send, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

type Screenshot = {
  name: string;
  type: (typeof IMAGE_TYPES)[number];
  dataUrl: string;
};

export function ReportProblem() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [steps, setSteps] = useState('');
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const close = () => {
    if (status === 'sending') return;
    setOpen(false);
    setError('');
  };

  const reset = () => {
    setMessage('');
    setSteps('');
    setScreenshot(null);
    setStatus('idle');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openReporter = () => {
    reset();
    setOpen(true);
  };

  const onScreenshot = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
      setError('Attach a PNG, JPEG, or WebP screenshot.');
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError('Screenshots must be smaller than 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setScreenshot({ name: file.name, type: file.type as Screenshot['type'], dataUrl: reader.result });
      setError('');
    };
    reader.onerror = () => setError('That screenshot could not be read. Try another file.');
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    if (message.trim().length < 10) {
      setError('Tell us a little more about the problem.');
      return;
    }
    setStatus('sending');
    setError('');

    try {
      await api.reportProblem({
        message: message.trim(),
        steps: steps.trim() || undefined,
        // Never email query strings or fragments: they can contain tokens or emails.
        pageUrl: `${window.location.origin}${window.location.pathname}`,
        userAgent: navigator.userAgent,
        screenshot: screenshot ?? undefined,
      });
      setStatus('sent');
    } catch (reason) {
      setStatus('idle');
      setError(reason instanceof ApiError ? reason.message : 'Could not send the report. Please try again.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openReporter}
        className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-card/95 px-3 py-2 text-xs text-ink-muted shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-brand/50 hover:text-ink"
        aria-label="Report a problem"
      >
        <Bug className="size-3.5 text-brand" />
        <span className="hidden sm:inline">Report a problem</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-problem-title"
            className="mx-auto mt-[7vh] w-full max-w-lg overflow-hidden rounded-2xl border border-line-strong bg-card shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-pale">Help us improve</p>
                <h2 id="report-problem-title" className="mt-1 text-lg font-semibold text-ink">Report a problem</h2>
                <p className="mt-1 text-xs text-ink-dim">Your report will be sent to info@optimusco.de.</p>
              </div>
              <button type="button" onClick={close} className="rounded-md p-1.5 text-ink-dim hover:bg-elevated hover:text-ink" aria-label="Close report form">
                <X className="size-4" />
              </button>
            </div>

            {status === 'sent' ? (
              <div className="px-5 py-12 text-center">
                <CheckCircle2 className="mx-auto size-10 text-good" />
                <h3 className="mt-4 text-base font-semibold text-ink">Thanks for the report.</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">We received it with the current page and browser details. We&rsquo;ll look into it.</p>
                <button type="button" onClick={close} className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-elevated px-4 text-sm font-medium text-ink hover:bg-elevated/80">Close</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5 px-5 py-5">
                <div className="rounded-xl border border-line bg-surface/70 px-4 py-3 text-xs leading-relaxed text-ink-dim">
                  <p className="font-medium text-ink-muted">Helpful details make this faster to fix:</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-4">
                    <li>Describe what you expected and what happened.</li>
                    <li>Add the steps that reproduce it, if you can.</li>
                    <li>Attach a screenshot when it helps show the issue.</li>
                  </ol>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink-muted">What went wrong?</span>
                  <textarea
                    required
                    minLength={10}
                    maxLength={5000}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="I was trying to… but…"
                    className="min-h-28 w-full resize-y rounded-xl border border-line bg-surface/80 px-3.5 py-3 text-sm text-ink placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ink-muted">Steps to reproduce <span className="font-normal text-ink-dim">(optional)</span></span>
                  <textarea
                    maxLength={2000}
                    value={steps}
                    onChange={(event) => setSteps(event.target.value)}
                    placeholder="1. Open…&#10;2. Click…&#10;3. See…"
                    className="min-h-20 w-full resize-y rounded-xl border border-line bg-surface/80 px-3.5 py-3 text-sm text-ink placeholder:text-ink-dim focus:border-brand/70 focus:outline-none"
                  />
                </label>

                <div>
                  <span className="text-xs font-medium text-ink-muted">Screenshot <span className="font-normal text-ink-dim">(optional, max 4 MB)</span></span>
                  <div className="mt-1.5 flex items-center gap-3">
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onScreenshot} className="sr-only" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-elevated/60 px-3 text-xs text-ink-muted hover:border-brand/50 hover:text-ink">
                      <ImagePlus className="size-3.5" /> Attach screenshot
                    </button>
                    {screenshot && (
                      <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-dim">
                        <Paperclip className="size-3 shrink-0" />
                        <span className="max-w-40 truncate">{screenshot.name}</span>
                        <button type="button" onClick={() => setScreenshot(null)} className="rounded p-0.5 hover:bg-elevated hover:text-ink" aria-label="Remove screenshot"><X className="size-3" /></button>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-ink-dim">Signed in as {user?.email}. The current page and browser are included automatically.</p>
                {error && <p role="alert" className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">{error}</p>}

                <div className="flex justify-end gap-2 border-t border-line pt-4">
                  <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm text-ink-muted hover:bg-elevated hover:text-ink">Cancel</button>
                  <button type="submit" disabled={status === 'sending'} className={cn('inline-flex h-10 items-center gap-2 rounded-xl bg-linear-to-br from-brand-strong to-brand px-4 text-sm font-medium text-white shadow-[0_8px_24px_-12px] shadow-brand-strong/80 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60')}>
                    <Send className="size-3.5" /> {status === 'sending' ? 'Sending…' : 'Send report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
