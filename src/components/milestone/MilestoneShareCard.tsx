import { forwardRef } from 'react';
import { formatDate } from '@/lib/utils';
import type { MilestoneRecap } from '@/lib/types';

export const MILESTONE_CARD_WIDTH = 1080;
export const MILESTONE_CARD_HEIGHT = 1350;

const INK = '#f2f2f7';
const MUTED = '#a1a1b0';
const DIM = '#6e6e80';
const SURFACE = '#161620';
const LINE = '#2b2b38';
const BRAND = '#8b7bff';
const ACCENT = '#22d3ee';
const DIFFICULTY = { Easy: '#34d399', Medium: '#fab219', Hard: '#f4696b' };

export const MilestoneShareCard = forwardRef<SVGSVGElement, { recap: MilestoneRecap }>(
  function MilestoneShareCard({ recap }, ref) {
    const topCount = recap.topTopics[0]?.count ?? 1;

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${MILESTONE_CARD_WIDTH} ${MILESTONE_CARD_HEIGHT}`}
        width={MILESTONE_CARD_WIDTH}
        height={MILESTONE_CARD_HEIGHT}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16 }}
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
      >
        <defs>
          <linearGradient id="milestone-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#211443" />
            <stop offset="48%" stopColor="#0b0b11" />
            <stop offset="100%" stopColor="#071b20" />
          </linearGradient>
          <linearGradient id="milestone-accent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="52%" stopColor={BRAND} />
            <stop offset="100%" stopColor={ACCENT} />
          </linearGradient>
          <radialGradient id="milestone-glow">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.38" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={MILESTONE_CARD_WIDTH} height={MILESTONE_CARD_HEIGHT} fill="url(#milestone-bg)" />
        <circle cx={120} cy={180} r={430} fill="url(#milestone-glow)" />
        <circle cx={980} cy={1180} r={360} fill="url(#milestone-glow)" opacity={0.65} />

        <g transform="translate(76, 78)">
          <circle cx={22} cy={22} r={20} fill="none" stroke="url(#milestone-accent)" strokeWidth={6}
                  strokeLinecap="round" strokeDasharray="96 30" transform="rotate(-58 22 22)" />
          <circle cx={37.5} cy={8.5} r={4.5} fill={ACCENT} />
          <text x={60} y={31} fill={INK} fontSize={26} fontWeight={650}>Optimus Code</text>
          <text x={928} y={31} fill={DIM} fontSize={22} textAnchor="end">Milestone recap</text>
        </g>

        <text x={76} y={210} fill={MUTED} fontSize={25}>
          {formatDate(recap.achievedOn, { day: 'numeric', month: 'long', year: 'numeric' })}
        </text>
        <text x={76} y={286} fill={INK} fontSize={58} fontWeight={650}>
          {recap.user.name.split(' ')[0]} reached
        </text>
        <text x={76} y={450} fill="url(#milestone-accent)" fontSize={172} fontWeight={800}>
          {recap.milestone}
        </text>
        <text x={76} y={510} fill={INK} fontSize={38} fontWeight={550}>problems solved</text>
        <text x={76} y={562} fill={MUTED} fontSize={27}>{recap.headline}</text>

        <g transform="translate(76, 630)">
          <rect width={928} height={226} rx={24} fill={SURFACE} stroke={LINE} />
          <text x={32} y={48} fill={DIM} fontSize={21} letterSpacing={2}>YOUR TOP LANES</text>
          {recap.topTopics.map((topic, index) => {
            const y = 82 + index * 48;
            const width = (topic.count / topCount) * 430;
            return (
              <g key={topic.topic} transform={`translate(32, ${y})`}>
                <text x={0} y={20} fill={MUTED} fontSize={23}>{topic.topic}</text>
                <rect x={310} y={4} width={430} height={18} rx={9} fill={LINE} />
                <rect x={310} y={4} width={Math.max(width, 12)} height={18} rx={9} fill={BRAND} />
                <text x={778} y={21} fill={INK} fontSize={23} fontWeight={650}>{topic.count}</text>
              </g>
            );
          })}
        </g>

        <g transform="translate(76, 890)">
          <rect width={928} height={180} rx={24} fill={SURFACE} stroke={LINE} />
          <text x={32} y={45} fill={DIM} fontSize={21} letterSpacing={2}>THE MIX</text>
          {(['Easy', 'Medium', 'Hard'] as const).map((level, index) => (
            <g key={level} transform={`translate(${32 + index * 296}, 76)`}>
              <circle cx={13} cy={13} r={9} fill={DIFFICULTY[level]} />
              <text x={34} y={21} fill={MUTED} fontSize={23}>{level}</text>
              <text x={0} y={72} fill={INK} fontSize={42} fontWeight={700}>{recap.difficulty[level]}</text>
            </g>
          ))}
        </g>

        <g transform="translate(76, 1104)">
          <rect width={928} height={158} rx={24} fill={SURFACE} stroke={LINE} />
          <Metric x={32} label="ACTIVE DAYS" value={String(recap.totals.activeDays)} />
          <Metric x={244} label="BEST STREAK" value={`${recap.streak.longest}d`} />
          <Metric x={456} label="BONUS SOLVES" value={String(recap.totals.bonus)} />
          <Metric x={684} label="NEXT TARGET" value={String(recap.nextMilestone)} tint={ACCENT} />
        </g>

        <text x={540} y={1312} fill={DIM} fontSize={21} textAnchor="middle">
          {recap.recommendation.daily} a day puts the next 50 about {recap.recommendation.projectedDays} days away
        </text>
      </svg>
    );
  },
);

function Metric({ x, label, value, tint = INK }: { x: number; label: string; value: string; tint?: string }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <text x={0} y={48} fill={DIM} fontSize={17} letterSpacing={1.4}>{label}</text>
      <text x={0} y={108} fill={tint} fontSize={42} fontWeight={700}>{value}</text>
    </g>
  );
}
