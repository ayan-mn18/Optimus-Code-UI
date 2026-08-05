export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type DayStatus = 'active' | 'complete' | 'missed';

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  avatarSeed: string;
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
  carriedOver?: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  greenDays: number;
  redDays: number;
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

export interface Session {
  user: User;
  enrollment: Enrollment | null;
  accessToken: string;
  refreshToken: string;
}
