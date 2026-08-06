import { forwardRef } from 'react';
import { RAMP, DIFFICULTY_STEP } from '@/components/charts/viz';
import { formatDate } from '@/lib/utils';
import type { Recap } from '@/lib/types';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const BG = '#0b0b11';
const SURFACE = '#14141c';
const LINE = '#262633';
const INK = '#f2f2f7';
const INK_MUTED = '#a1a1b0';
const INK_DIM = '#6e6e80';
const GOOD = '#34d399';
const BAD = '#f4696b';
const FROST = '#38bdf8';

/**
 * The shareable card, drawn as pure SVG — no foreignObject, no web fonts, no
 * html-to-canvas dependency. That keeps it rasterisable: the browser can draw
 * this straight onto a canvas and hand back a PNG. Everything is laid out on a
 * fixed 1080×1350 board so the exported image is identical everywhere.
 */
export const RecapCard = forwardRef<SVGSVGElement, { recap: Recap }>(function RecapCard({ recap }, ref) {
  const { totals, days, topics, streak, change } = recap;
  const maxSolved = Math.max(...days.map((day) => day.solved), 1);

  const dayColour = (status: string) => {
    if (status === 'complete') return GOOD;
    if (status === 'frozen') return FROST;
    if (status === 'missed') return BAD;
    return LINE;
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16 }}
      fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
    >
      <defs>
        <linearGradient id="recap-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#141126" />
          <stop offset="45%" stopColor={BG} />
          <stop offset="100%" stopColor="#0b1418" />
        </linearGradient>
        <linearGradient id="recap-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="55%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="recap-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={CARD_WIDTH} height={CARD_HEIGHT} fill="url(#recap-bg)" />
      <circle cx={140} cy={120} r={420} fill="url(#recap-glow)" />
      <circle cx={980} cy={1180} r={360} fill="url(#recap-glow)" />

      {/* ---- header ---------------------------------------------------- */}
      <g transform="translate(80, 96)">
        <circle cx={22} cy={22} r={20} fill="none" stroke="url(#recap-accent)" strokeWidth={6}
                strokeLinecap="round" strokeDasharray="96 30" transform="rotate(-58 22 22)" />
        <circle cx={37.5} cy={8.5} r={4.5} fill="#22d3ee" />
        <text x={60} y={31} fill={INK} fontSize={26} fontWeight={600}>
          Optimus Code
        </text>
        <text x={CARD_WIDTH - 160} y={31} fill={INK_DIM} fontSize={22} textAnchor="end">
          Weekly recap
        </text>
      </g>

      <text x={80} y={230} fill={INK_MUTED} fontSize={26}>
        {formatDate(recap.weekStart, { day: 'numeric', month: 'short' })} –{' '}
        {formatDate(recap.weekEnd, { day: 'numeric', month: 'short', year: 'numeric' })}
      </text>

      <text x={80} y={310} fill={INK} fontSize={62} fontWeight={600}>
        {recap.user.name.split(' ')[0]}&rsquo;s week
      </text>

      <text x={80} y={368} fill="url(#recap-accent)" fontSize={32} fontWeight={500}>
        {recap.headline}
      </text>

      {/* ---- hero number ------------------------------------------------ */}
      <g transform="translate(80, 430)">
        <rect width={CARD_WIDTH - 160} height={210} rx={24} fill={SURFACE} stroke={LINE} />
        <text x={44} y={78} fill={INK_DIM} fontSize={24} letterSpacing={2}>
          PROBLEMS SOLVED
        </text>
        <text x={40} y={172} fill={INK} fontSize={116} fontWeight={700}>
          {totals.solved}
        </text>

        {change.previousSolved > 0 && (
          <text x={40 + String(totals.solved).length * 66 + 24} y={172} fontSize={30}
                fill={change.solved >= 0 ? GOOD : INK_DIM} fontWeight={500}>
            {change.solved >= 0 ? '▲' : '▼'} {Math.abs(change.solved)} vs last week
          </text>
        )}

        <g transform={`translate(${CARD_WIDTH - 160 - 300}, 46)`}>
          <Stat x={0} label="GREEN DAYS" value={totals.greenDays} tint={GOOD} />
          <Stat x={150} label="TOPICS" value={totals.topicsTouched} tint={INK} />
        </g>
      </g>

      {/* ---- daily bars -------------------------------------------------- */}
      <g transform="translate(80, 690)">
        <text x={0} y={0} fill={INK_DIM} fontSize={24} letterSpacing={2}>
          DAY BY DAY
        </text>

        {days.map((day, index) => {
          const columnWidth = (CARD_WIDTH - 160) / 7;
          const x = index * columnWidth;
          const barMax = 150;
          const height = day.solved ? Math.max(14, (day.solved / maxSolved) * barMax) : 6;

          return (
            <g key={day.date} transform={`translate(${x}, 40)`}>
              <rect x={16} y={barMax - height} width={columnWidth - 32} height={height} rx={7}
                    fill={day.solved ? RAMP[3] : LINE} />
              <text x={columnWidth / 2} y={barMax + 36} fill={INK_MUTED} fontSize={22} textAnchor="middle">
                {day.label}
              </text>
              <circle cx={columnWidth / 2} cy={barMax + 62} r={6} fill={dayColour(day.status)} />
              {day.solved > 0 && (
                <text x={columnWidth / 2} y={barMax - height - 14} fill={INK} fontSize={24}
                      fontWeight={600} textAnchor="middle">
                  {day.solved}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* ---- topics ------------------------------------------------------ */}
      <g transform="translate(80, 985)">
        <text x={0} y={0} fill={INK_DIM} fontSize={24} letterSpacing={2}>
          TOPICS THIS WEEK
        </text>

        {topics.slice(0, 5).map((topic, index) => {
          const barWidth = 520;
          const width = (topic.count / (topics[0]?.count || 1)) * barWidth;
          return (
            <g key={topic.topic} transform={`translate(0, ${30 + index * 38})`}>
              <text x={0} y={16} fill={INK_MUTED} fontSize={24}>
                {topic.topic}
              </text>
              <rect x={330} y={2} width={barWidth} height={16} rx={8} fill={LINE} />
              <rect x={330} y={2} width={Math.max(width, 10)} height={16} rx={8} fill={RAMP[3]} />
              <text x={330 + barWidth + 24} y={17} fill={INK} fontSize={24} fontWeight={600}>
                {topic.count}
              </text>
            </g>
          );
        })}

        {topics.length === 0 && (
          <text x={0} y={54} fill={INK_DIM} fontSize={26}>
            Nothing solved this week yet.
          </text>
        )}
      </g>

      {/* ---- footer strip -------------------------------------------------- */}
      <g transform="translate(80, 1218)">
        <rect width={CARD_WIDTH - 160} height={92} rx={20} fill={SURFACE} stroke={LINE} />

        <Pill x={32} label="Streak" value={`${streak.current} d`} tint="#fab219" />
        <Pill x={272} label="Best ever" value={`${streak.longest} d`} tint={INK} />
        <Pill x={512} label="Bonus" value={String(totals.bonus)} tint="#a78bfa" />
        <Pill
          x={720}
          label="Difficulty"
          value={`${recap.difficulty.Easy}/${recap.difficulty.Medium}/${recap.difficulty.Hard}`}
          tint={DIFFICULTY_STEP.Medium}
        />
      </g>
    </svg>
  );
});

function Stat({ x, label, value, tint }: { x: number; label: string; value: number; tint: string }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <text x={0} y={26} fill={INK_DIM} fontSize={20} letterSpacing={1.5}>
        {label}
      </text>
      <text x={0} y={94} fill={tint} fontSize={64} fontWeight={700}>
        {value}
      </text>
    </g>
  );
}

function Pill({ x, label, value, tint }: { x: number; label: string; value: string; tint: string }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <text x={0} y={38} fill={INK_DIM} fontSize={20} letterSpacing={1.5}>
        {label.toUpperCase()}
      </text>
      <text x={0} y={74} fill={tint} fontSize={30} fontWeight={600}>
        {value}
      </text>
    </g>
  );
}
