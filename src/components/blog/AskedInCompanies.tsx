import { Building2, ExternalLink } from 'lucide-react';
import { Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { CompanyTag } from '@/lib/types';

/**
 * Where this question has been reported asked. Every card carries its own
 * evidence link — a company tag with no source is shown as unverified rather
 * than quietly presented as fact.
 */
export function AskedInCompanies({ companies }: { companies: CompanyTag[] }) {
  if (!companies.length) return null;

  const peak = Math.max(...companies.map((company) => company.count ?? 0), 1);
  const ranked = [...companies].sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.name.localeCompare(b.name));

  return (
    <section aria-labelledby="asked-in" className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="asked-in" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Building2 className="size-4 text-brand" />
            Asked in companies
          </h2>
          <p className="mt-1 text-xs text-ink-dim">
            Aggregated from public interview reports and problem-set company tags. Follow a source to check it yourself.
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-line bg-elevated/60 px-2 py-1 text-[11px] text-ink-muted">
          {companies.length} companies
        </span>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {ranked.map((company) => {
          const source = company.sources?.[0];
          return (
            <li key={company.name} className="relative overflow-hidden rounded-xl border border-line bg-surface/60 p-3">
              {company.count ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-brand/8"
                  style={{ width: `${Math.max(8, ((company.count ?? 0) / peak) * 100)}%` }}
                />
              ) : null}
              <div className="relative flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{company.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {company.roles?.map((role) => <Chip key={role}>{role}</Chip>)}
                    {company.lastSeen && <Chip className="text-ink-dim">last seen {company.lastSeen}</Chip>}
                    {!source && <Chip className="border-warn/30 text-warn">unverified</Chip>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {company.count ? (
                    <span className="rounded-md border border-brand/25 bg-brand/10 px-1.5 py-0.5 text-[11px] tabular-nums text-brand-pale">
                      {company.count}×
                    </span>
                  ) : null}
                  {source && (
                    <a
                      href={source}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`Source for ${company.name}`}
                      className={cn('grid size-7 place-items-center rounded-lg text-ink-dim', 'hover:bg-elevated hover:text-brand')}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
