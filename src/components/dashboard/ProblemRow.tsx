import { motion } from 'framer-motion';
import { Check, ExternalLink, Youtube, FileText, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DifficultyBadge, Chip } from '@/components/ui/primitives';
import type { Problem } from '@/lib/types';

interface ProblemRowProps {
  problem: Problem;
  index?: number;
  onToggle?: (problem: Problem, solved: boolean) => void;
  pending?: boolean;
  compact?: boolean;
}

export function ProblemRow({ problem, index = 0, onToggle, pending, compact }: ProblemRowProps) {
  const solved = Boolean(problem.solved);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl border border-line bg-surface/60 px-3 py-2.5 transition-colors',
        'hover:border-line-strong hover:bg-elevated/60',
        solved && 'border-good/20 bg-good/[0.04]',
        compact && 'py-2',
      )}
    >
      {onToggle && (
        <button
          type="button"
          role="checkbox"
          aria-checked={solved}
          aria-label={`${solved ? 'Unmark' : 'Mark'} ${problem.title} as solved`}
          disabled={pending}
          onClick={() => onToggle(problem, !solved)}
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-md border transition-all duration-150',
            solved
              ? 'border-good bg-good text-canvas'
              : 'border-line-strong text-transparent hover:border-brand hover:bg-brand/10',
            pending && 'opacity-50',
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium text-ink', solved && 'text-ink-muted line-through')}>
          {problem.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Chip>{problem.topic}</Chip>
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.carriedOver && (
            <Chip className="border-warn/30 bg-warn/10 text-warn">
              <RotateCcw className="size-3" /> Back from a red day
            </Chip>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
        {problem.leetcode_url && (
          <IconLink href={problem.leetcode_url} label={`Open ${problem.title} on LeetCode`}>
            <ExternalLink className="size-4" />
          </IconLink>
        )}
        {problem.youtube_url && (
          <IconLink href={problem.youtube_url} label={`Watch the ${problem.title} walkthrough`}>
            <Youtube className="size-4" />
          </IconLink>
        )}
        {problem.article_url && (
          <IconLink href={problem.article_url} label={`Read the ${problem.title} article`}>
            <FileText className="size-4" />
          </IconLink>
        )}
      </div>
    </motion.li>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-lg text-ink-dim transition-colors hover:bg-elevated hover:text-brand"
    >
      {children}
    </a>
  );
}
