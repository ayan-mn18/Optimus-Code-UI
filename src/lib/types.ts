export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type DayStatus = 'active' | 'complete' | 'missed' | 'frozen';

export interface FreezeBalance {
  earned: number;
  used: number;
  available: number;
  nextAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  avatarSeed: string;
  showOnLeaderboard: boolean;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  daily_target: number;
  status: 'active' | 'paused';
  started_on: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  leetcode_url: string | null;
  youtube_url: string | null;
  article_url: string | null;
  order_index: number;
  solved?: boolean;
  solvedOn?: string | null;
  position?: number;
  round?: number;
  carriedOver?: boolean;
}

export interface ProblemListResponse {
  items: Problem[];
  total: number;
}

export interface Streak {
  current: number;
  longest: number;
  greenDays: number;
  redDays: number;
  frozenDays: number;
  freezes: FreezeBalance;
}

export interface TodayResponse {
  date: string;
  timezone: string;
  target: number;
  solvedCount: number;
  bonusCount: number;
  status: DayStatus;
  isComplete: boolean;
  closedDays: { date: string; status: DayStatus; solved: number }[];
  problems: Problem[];
  /** Extra sets dealt after the target was met, newest first and never counted toward it. */
  extraSets: { round: number; problems: Problem[] }[];
  canExtend: boolean;
  bonusProblems: Problem[];
  streak: Streak;
}

export interface TopicStat {
  topic: string;
  total: number;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface HeatCell {
  date: string;
  count: number;
  status: DayStatus | 'idle' | 'none';
  target: number | null;
}

export interface Overview {
  totals: { totalProblems: number; solved: number; percent: number; bonusSolved: number; backlog: number };
  streak: Streak;
  topics: TopicStat[];
  difficulty: { difficulty: Difficulty; total: number; solved: number; percent: number }[];
  heatmap: HeatCell[];
  recentDays: { log_date: string; status: DayStatus; solved_count: number; bonus_count: number; required_count: number }[];
}

export interface LeaderboardEntry {
  rank: number | null;
  userId: string;
  name: string;
  avatarSeed: string;
  streak: number;
  longestStreak: number;
  greenDays: number;
  solved: number;
  joinedOn: string;
}

export interface Leaderboard {
  metric: 'streak' | 'solved' | 'consistency';
  total: number;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry & { onBoard: boolean; inTop: boolean };
}

export interface RecapDay {
  date: string;
  label: string;
  solved: number;
  target: number | null;
  status: DayStatus | 'upcoming' | 'none';
  isToday: boolean;
}

export interface Recap {
  weekStart: string;
  weekEnd: string;
  weeksAgo: number;
  isCurrentWeek: boolean;
  daysElapsed: number;
  user: { name: string; avatarSeed: string };
  totals: {
    solved: number;
    bonus: number;
    greenDays: number;
    redDays: number;
    frozenDays: number;
    topicsTouched: number;
  };
  change: { solved: number; previousSolved: number; percent: number | null };
  days: RecapDay[];
  bestDay: RecapDay | null;
  topics: { topic: string; count: number }[];
  difficulty: Record<Difficulty, number>;
  streak: Streak;
  headline: string;
}

export interface Session {
  user: User;
  enrollment: Enrollment | null;
  accessToken: string;
  refreshToken: string;
}
