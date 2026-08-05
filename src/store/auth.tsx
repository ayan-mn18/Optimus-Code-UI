import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, tokenStore } from '@/lib/api';
import { browserTimezone } from '@/lib/utils';
import type { Enrollment, Session, User } from '@/lib/types';

interface AuthValue {
  user: User | null;
  enrollment: Enrollment | null;
  ready: boolean;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setEnrollment: (enrollment: Enrollment) => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  const adopt = useCallback((session: Session) => {
    tokenStore.save(session.accessToken, session.refreshToken);
    setUser(session.user);
    setEnrollment(session.enrollment);
  }, []);

  const clear = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setEnrollment(null);
    queryClient.clear();
  }, [queryClient]);

  // Restore the session on boot, and drop it if the refresh token dies mid-session.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!tokenStore.access && !tokenStore.refresh) {
        setReady(true);
        return;
      }
      try {
        const { user: me, enrollment: current } = await api.me();
        if (cancelled) return;
        setUser(me);
        setEnrollment(current);
      } catch {
        if (!cancelled) tokenStore.clear();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    window.addEventListener('oc:signed-out', clear);
    return () => {
      cancelled = true;
      window.removeEventListener('oc:signed-out', clear);
    };
  }, [clear]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      enrollment,
      ready,
      signup: async (data) => adopt(await api.signup({ ...data, timezone: browserTimezone() })),
      login: async (data) => adopt(await api.login(data)),
      logout: async () => {
        try {
          await api.logout();
        } finally {
          clear();
        }
      },
      setEnrollment,
      setUser,
    }),
    [user, enrollment, ready, adopt, clear],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
