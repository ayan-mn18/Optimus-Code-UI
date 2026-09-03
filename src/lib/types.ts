export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemKind = 'DSA' | 'LLD' | 'HLD';
export type DailyGoals = Record<ProblemKind, number>;
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
  pictureUrl: string | null;
  authProvider: 'password' | 'google';
  avatarSeed: string;
  showOnLeaderboard: boolean;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  dsa_target: number;
  lld_target: number;
  hld_target: number;
  status: 'active' | 'paused';
  started_on: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  kind: ProblemKind;
  topic: string;
  subtopic?: string | null;
  difficulty: Difficulty;
  description?: string | null;
  leetcode_url: string | null;
  youtube_url: string | null;
  article_url: string | null;
  practice_url?: string | null;
  source_url?: string | null;
  assessment_enabled?: boolean;
  coding_enabled?: boolean;
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
export interface SystemDesignListResponse {
  kind: 'LLD' | 'HLD';
  items: Problem[];
  total: number;
  catalogTotal: number;
  topics: { topic: string; total: number; solved: number }[];
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
  targets: DailyGoals;
  solvedCount: number;
  progress: DailyGoals;
  bonusCount: number;
  status: DayStatus;
  isComplete: boolean;
  closedDays: { date: string; status: DayStatus; solved: number }[];
  problems: Problem[];
  /** DSA-only extra sets, newest first and never counted toward goals. */
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
  tracks: { kind: ProblemKind; total: number; solved: number; percent: number }[];
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
  tracks: { kind: ProblemKind; solved: number }[];
  streak: Streak;
  headline: string;
}

export interface MilestoneRecap {
  milestone: number;
  nextMilestone: number;
  achievedOn: string;
  user: { name: string; avatarSeed: string };
  headline: string;
  totals: {
    solved: number;
    activeDays: number;
    bonus: number;
    topicsTouched: number;
    trackedMinutes: number;
  };
  topTopics: { topic: string; count: number }[];
  difficulty: Record<Difficulty, number>;
  rhythm: {
    firstSolvedOn: string;
    bestDate: string | null;
    bestDateCount: number;
    strongestDay: string | null;
    strongestDayCount: number;
    averagePerActiveDay: number;
    weeklyPace: number;
  };
  streak: Pick<Streak, 'current' | 'longest' | 'greenDays'>;
  recommendation: {
    daily: number;
    remaining: number;
    projectedDays: number;
  };
}

export type AssessmentStatus = 'generating' | 'active' | 'grading' | 'passed' | 'failed';
export type AssessmentAnswer = { text: string } | { value: string } | { source: string };

export interface AssessmentTest {
  name: string;
  input: { id: number; available: boolean }[];
  expected: number | null;
}

export interface AssessmentQuestion {
  id: string;
  type: 'text' | 'multiple_choice' | 'code';
  label: string;
  prompt: string;
  context: string;
  options?: string[];
  starterCode?: string;
  visibleTests?: AssessmentTest[];
}

export interface AssessmentAttempt {
  id: string;
  problemId: string;
  status: AssessmentStatus;
  score: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  questions: AssessmentQuestion[];
  answers: Record<string, AssessmentAnswer>;
}

export interface AssessmentResponse {
  attempt: AssessmentAttempt;
  problem: Pick<Problem, 'id' | 'title' | 'kind' | 'topic' | 'subtopic' | 'difficulty'>;
}

export interface CodeRunResult {
  passed: boolean;
  results: { name: string; passed: boolean; expected?: unknown; actual?: unknown; error?: string }[];
  status: string;
  stderr: string;
  time: string | null;
  memory: number | null;
}

export interface Subscription {
  plan: 'monthly' | 'annual';
  status: 'pending' | 'active' | 'on_hold' | 'paused' | 'cancelled' | 'failed' | 'expired';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface Session {
  user: User;
  enrollment: Enrollment | null;
  accessToken: string;
  refreshToken: string;
}
