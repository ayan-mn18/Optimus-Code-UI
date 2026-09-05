import { Building2, ExternalLink, FileText, Layers, MessageSquareQuote } from 'lucide-react';
import { Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { CompanyTag, Evidence } from '@/lib/types';

/**
 * Where this question has been reported asked.
 *
 * The section is built around the *source*, not the company: each write-up is
 * listed once with every company it names, and each company links back to the
 * numbered sources that actually mention it. That numbering is the whole point —
 * it is what stops a dozen company cards from all pointing at one generic URL.
 */

const KIND_META = {
  report: {
    icon: MessageSquareQuote,
    label: 'First-hand report',
    hint: 'Someone describing their own interview.',
    className: 'text-good border-good/30 bg-good/10',
  },
  aggregate: {
    icon: Layers,
    label: 'Aggregated reports',
    hint: 'A site tallying many candidates.',
    className: 'text-brand-pale border-brand/30 bg-brand/10',
  },
  roundup: {
    icon: FileText,
    label: 'Editorial claim',
    hint: "A writer's assertion, not a first-hand account.",
    className: 'text-warn border-warn/30 bg-warn/10',
  },
} as const;

const CONFIDENCE_STYLE = {
  reported: 'border-good/30 bg-good/10 text-good',
  aggregated: 'border-brand/25 bg-brand/10 text-brand-pale',
  claimed: 'border-warn/30 bg-warn/10 text-warn',
} as const;

/** Sources first-hand first, so the strongest evidence is numbered [1]. */
const KIND_ORDER = { report: 0, aggregate: 1, roundup: 2 } as const;

export function AskedInCompanies({ companies, evidence }: { companies: CompanyTag[]; evidence: Evidence[] }) {
  if (!evidence.length) return null;

  const ordered = [...evidence].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  const indexOf = new Map(ordered.map((item, index) => [item.url, index + 1]));
  const firstHand = ordered.filter((item) => item.kind === 'report').length;

  return (
    <section aria-labelledby="asked-in" className="card overflow-hidden">
      <div className="border-b border-line p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="asked-in" className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Building2 className="size-4 text-brand" />
              Asked in companies
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-ink-dim">
              Every company below is named by at least one of the numbered sources. Follow the numbers to read the
              account it came from.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-lg border border-line bg-elevated/60 px-2 py-1 text-ink-muted">
              {companies.length} companies
            </span>
            <span className="rounded-lg border border-line bg-elevated/60 px-2 py-1 text-ink-muted">
              {evidence.length} sources
            </span>
            {firstHand > 0 && (
              <span className="rounded-lg border border-good/25 bg-good/10 px-2 py-1 text-good">
                {firstHand} first-hand
              </span>
            )}
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {companies.map((company) => (
            <li key={company.name}>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[12px]',
                  CONFIDENCE_STYLE[company.confidence],
                )}
                title={`${company.confidence}${company.roles.length ? ` · ${company.roles.join(', ')}` : ''}${company.lastSeen ? ` · last seen ${company.lastSeen}` : ''}`}
              >
                <span className="font-medium text-ink">{company.name}</span>
                {company.roles.map((role) => (
                  <span key={role} className="text-[10px] opacity-80">{role}</span>
                ))}
                {company.lastSeen && <span className="text-[10px] text-ink-dim">{company.lastSeen}</span>}
                <span className="flex items-center gap-0.5">
                  {/* Ascending, so the refs read like footnote markers rather than insertion order. */}
                  {[...company.sources]
                    .sort((a, b) => (indexOf.get(a) ?? 0) - (indexOf.get(b) ?? 0))
                    .map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Source ${indexOf.get(url)} for ${company.name}`}
                      className="rounded bg-canvas/60 px-1 text-[10px] tabular-nums text-ink-muted hover:text-brand"
                    >
                      {indexOf.get(url)}
                    </a>
                  ))}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ol className="divide-y divide-line">
        {ordered.map((item, index) => {
          const meta = KIND_META[item.kind] ?? KIND_META.roundup;
          const Icon = meta.icon;
          return (
            <li key={item.url} className="flex gap-3 p-4 hover:bg-elevated/30">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-line bg-elevated text-[11px] tabular-nums text-ink-muted">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand-pale"
                  >
                    {item.title}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                  {item.source && <span className="font-mono text-[11px] text-ink-dim">{item.source}</span>}
                  <span
                    className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]', meta.className)}
                    title={meta.hint}
                  >
                    <Icon className="size-3" />
                    {meta.label}
                  </span>
                </div>

                <ul className="flex flex-wrap gap-1">
                  {item.companies.map((mention) => (
                    <li key={mention.name}>
                      <Chip>
                        {mention.name}
                        {(mention.role || mention.date) && (
                          <span className="text-ink-dim">
                            {[mention.role, mention.date].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </Chip>
                    </li>
                  ))}
                </ul>

                {item.quote && (
                  <blockquote className="border-l-2 border-line-strong pl-3 text-xs italic leading-relaxed text-ink-muted">
                    “{item.quote}”
                  </blockquote>
                )}
                {item.note && <p className="text-xs leading-relaxed text-ink-dim">{item.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
