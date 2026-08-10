import type {
  Enrollment,
  Leaderboard,
  Overview,
  Problem,
  ProblemListResponse,
  Recap,
  Session,
  Streak,
  TodayResponse,
  User,
} from './types';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const ACCESS_KEY = 'oc.access';
const REFRESH_KEY = 'oc.refresh';

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  save(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

/** Swaps the refresh token for a new pair. Concurrent 401s share one attempt. */
async function refreshSession(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;

  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const session: Session = await res.json();
      tokenStore.save(session.accessToken, session.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      queueMicrotask(() => {
        refreshInFlight = null;
      });
    }
  })();

  return refreshInFlight;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('content-type', 'application/json');
  const token = tokenStore.access;
  if (token) headers.set('authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && retry && tokenStore.refresh) {
    if (await refreshSession()) return request<T>(path, init, false);
    tokenStore.clear();
    window.dispatchEvent(new CustomEvent('oc:signed-out'));
  }

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, payload?.error?.message ?? 'Something went wrong', payload?.error?.details);
  }

  return payload as T;
}

const body = (data: unknown) => ({ body: JSON.stringify(data) });

export const api = {
  signup: (data: { name: string; email: string; password: string; timezone: string }) =>
    request<Session>('/api/auth/signup', { method: 'POST', ...body(data) }),

  login: (data: { email: string; password: string }) =>
    request<Session>('/api/auth/login', { method: 'POST', ...body(data) }),

  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),

  me: () => request<{ user: User; enrollment: Enrollment | null }>('/api/auth/me'),

  updateProfile: (data: { name?: string; timezone?: string; showOnLeaderboard?: boolean }) =>
    request<{ user: User }>('/api/auth/me', { method: 'PATCH', ...body(data) }),

  challenge: () => request<{ enrollment: Enrollment | null; streak: Streak | null }>('/api/challenge'),

  enroll: (dailyTarget: number) =>
    request<{ enrollment: Enrollment }>('/api/challenge/enroll', { method: 'POST', ...body({ dailyTarget }) }),

  today: () => request<TodayResponse>('/api/challenge/today'),

  extendToday: () => request<TodayResponse>('/api/challenge/extend', { method: 'POST' }),

  solve: (problemId: string, data: { timeSpentMin?: number | null; notes?: string | null } = {}) =>
    request<{ problem: Problem; isBonus: boolean; day: TodayResponse | null; streak: Streak }>(
      `/api/challenge/solve/${problemId}`,
      { method: 'POST', ...body(data) },
    ),

  unsolve: (problemId: string) =>
    request<{ problemId: string; streak: Streak }>(`/api/challenge/solve/${problemId}`, { method: 'DELETE' }),

  overview: () => request<Overview>('/api/dashboard/overview'),

  problems: () => request<ProblemListResponse>('/api/dashboard/problems'),


  recap: (weeksAgo = 0) => request<Recap>(`/api/dashboard/recap?weeksAgo=${weeksAgo}`),

  leaderboard: (metric: Leaderboard['metric'] = 'streak') =>
    request<Leaderboard>(`/api/leaderboard?metric=${metric}`),

  waitlistCount: () => request<{ count: number }>('/api/waitlist'),

  joinWaitlist: (data: { email: string; name?: string; referrer?: string }) =>
    request<{ joined: boolean; alreadyJoined: boolean; count: number }>('/api/waitlist', {
      method: 'POST',
      ...body(data),
    }),
};
