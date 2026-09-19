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
  billingExempt: boolean;
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
  /** Slug of the published write-up for this problem, when one exists. */
  blogSlug?: string | null;
}

export interface ProblemListResponse {
  items: Problem[];
  total: number;
}

export interface SearchResult {
  type: 'problem' | 'blog';
  id: string;
  slug: string;
  title: string;
  kind: ProblemKind | BlogKind;
  topic: string | null;
  subtopic: string | null;
  difficulty: Difficulty | null;
}

export interface SearchResponse {
  items: SearchResult[];
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
export type CodingLanguage = 'python' | 'javascript' | 'java';

/** Options for an MCQ; source for anything that is executed. */
export type AssessmentAnswer = { values: string[] } | { language?: string; source: string };

export const isChoiceAnswer = (answer: AssessmentAnswer | undefined): answer is { values: string[] } =>
  Boolean(answer && 'values' in answer);

export interface LanguageChoice {
  id: CodingLanguage | 'sql';
  label: string;
  monaco: string;
}

export interface EntityMethod {
  name: string;
  params: { name: string; type: string }[];
  returns: string;
}

export interface QuestionEntity {
  name: string;
  constructorParams: { name: string; type: string }[];
  methods: EntityMethod[];
}

export interface VisibleTest {
  name: string;
  steps: { op: string; args: unknown[]; expect?: string }[];
}

interface QuestionBase {
  id: string;
  weight: number;
  conceptArea: string;
}

export interface McqQuestion extends QuestionBase {
  type: 'mcq';
  label: string;
  prompt: string;
  context: string;
  selectionMode: 'single' | 'multiple';
  options: string[];
}

export interface CodingQuestion extends QuestionBase {
  type: 'machine_coding' | 'debug';
  title: string;
  statement: string;
  entity: QuestionEntity;
  languages: LanguageChoice[];
  minutes: number | null;
  visibleTests: VisibleTest[];
  starters: Record<string, string>;
}

export interface SqlQuestion extends QuestionBase {
  type: 'sql';
  title: string;
  statement: string;
  schema: string;
  orderMatters: boolean;
  sampleSeed: string;
  sampleName: string;
  starter: string;
}

export type AssessmentQuestion = McqQuestion | CodingQuestion | SqlQuestion;

export interface RunResult {
  name: string;
  visible: boolean;
  passed: boolean;
  step?: string;
  expected?: string;
  actual?: string;
  error?: string;
}

export interface RunResponse {
  passed: boolean;
  passedCount: number;
  total: number;
  results: RunResult[];
  stderr: string;
  compileOutput: string;
  runsLeft: number;
  status?: { id: number; description: string };
  time?: string | null;
  memory?: number | null;
}

/** Everything held back until the paper is submitted. */
export interface AssessmentReviewItem {
  id: string;
  score: number;
  weight: number;
  feedback: string;
  correctAnswers?: string[];
  explanation?: string;
  referenceQuery?: string;
  rubricNotes?: string;
  bugSummary?: string;
  referenceSolution?: { language: string; source: string };
  results?: RunResult[];
}

export interface AssessmentAttempt {
  id: string;
  problemId: string;
  status: AssessmentStatus;
  kind: 'LLD' | 'HLD' | null;
  score: number | null;
  maxScore: number | null;
  passRatio: number;
  language: CodingLanguage | null;
  startedAt: string | null;
  submittedAt: string | null;
  completedAt: string | null;
  questionsReady: number;
  totalQuestions: number;
  generationComplete: boolean;
  generationError: string | null;
  questions: AssessmentQuestion[];
  answers: Record<string, AssessmentAnswer>;
  review?: AssessmentReviewItem[];
}

export interface AssessmentResponse {
  attempt: AssessmentAttempt;
  problem: Pick<Problem, 'id' | 'title' | 'kind' | 'topic' | 'subtopic' | 'difficulty'>;
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

/* -------------------------------------------------------------------------- */
/* Blogs                                                                       */
/* -------------------------------------------------------------------------- */

export type BlogKind = ProblemKind | 'General';
export type BlogStatus = 'draft' | 'published';
export type BlogOrigin = 'user' | 'pipeline' | 'editorial';
export type CalloutTone = 'info' | 'tip' | 'warn' | 'gotcha' | 'interview';

/**
 * An article is an ordered list of typed blocks rather than a markdown string:
 * the reader renders diagrams and interactive widgets from them, and the
 * research pipeline emits them directly as JSON. Unknown types are skipped, so
 * the pipeline may run ahead of the renderer.
 */
export type BlogBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'callout'; tone: CalloutTone; title?: string; text: string }
  | { type: 'code'; language: string; filename?: string; code: string }
  | { type: 'mermaid'; title?: string; caption?: string; code: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'steps'; items: { title: string; text: string }[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'widget'; name: string; title?: string; caption?: string }
  | { type: 'divider' }
  | { type: string; [key: string]: unknown };

/**
 * Provenance is keyed on the source, not the company: one link carries every
 * company it names. `CompanyTag` is derived from this server-side, so a company
 * card always links to the sources that actually mention it — and a company no
 * source mentions cannot appear at all.
 */
export interface Evidence {
  url: string;
  title: string;
  source?: string;
  /** report = a first-hand write-up · aggregate = a site's tally · roundup = a writer's claim */
  kind: 'report' | 'aggregate' | 'roundup';
  quote?: string;
  note?: string;
  companies: { name: string; role?: string; date?: string }[];
}

export interface CompanyTag {
  name: string;
  /** Distinct sources naming this company — not a guessed frequency. */
  count: number;
  roles: string[];
  lastSeen?: string;
  sources: string[];
  confidence: 'reported' | 'aggregated' | 'claimed';
}

export interface BlogRef {
  title: string;
  url: string;
  source?: string;
  kind: 'problem' | 'article' | 'discussion' | 'video' | 'repo' | 'other';
  note?: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: BlogKind;
  problemId: string | null;
  topic: string | null;
  difficulty: Difficulty | null;
  author: { id: string | null; name: string };
  origin: BlogOrigin;
  status: BlogStatus;
  coverEmoji: string;
  readMinutes: number;
  tags: string[];
  evidence: Evidence[];
  companies: CompanyTag[];
  refs: BlogRef[];
  views: number;
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  isAuthor: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  blocks?: BlogBlock[];
}

export interface BlogListResponse {
  items: Blog[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    topics: string[];
    tags: string[];
    companies: { name: string; blogs: number }[];
    kinds: BlogKind[];
  };
}

export interface BlogDetailResponse {
  blog: Blog & { blocks: BlogBlock[] };
  related: Blog[];
}

export interface BlogDraft {
  title: string;
  slug?: string;
  summary?: string;
  kind: BlogKind;
  problemId?: string | null;
  topic?: string;
  difficulty?: Difficulty | null;
  coverEmoji?: string;
  status: BlogStatus;
  blocks: BlogBlock[];
  tags: string[];
  /** Company tags are derived from this by the API, so drafts never send them. */
  evidence: Evidence[];
  refs: BlogRef[];
}

/* -------------------------------------------------------------------------- */
/* Research jobs                                                               */
/* -------------------------------------------------------------------------- */

export type ResearchStatus = 'queued' | 'running' | 'needs_review' | 'published' | 'failed';

export type ResearchAudience = 'beginner' | 'intermediate' | 'interview' | 'senior';
export type ResearchFormat = 'interview-guide' | 'deep-dive' | 'decision-guide' | 'comparison';

export interface ResearchBrief {
  topic: string;
  goal: string;
  audience: ResearchAudience;
  format: ResearchFormat;
  questions: string[];
  constraints?: string;
}

export interface ResearchJob {
  id: string;
  request: string;
  brief: ResearchBrief;
  status: ResearchStatus;
  stage: string | null;
  progress: { at: string; message: string }[];
  slug: string | null;
  blogId: string | null;
  error: string | null;
  modelVersion: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}
