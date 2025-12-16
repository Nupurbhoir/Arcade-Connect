import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ac_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ac_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const isAuthed = Boolean(token);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthed,
      async refresh() {
        if (!token) return;
        const res = await apiFetch('/api/users/me', { token });
        if (res?.user) {
          setUser(res.user);
          localStorage.setItem('ac_user', JSON.stringify(res.user));
          localStorage.setItem('ac_userId', res.user.id);
          localStorage.setItem('ac_username', res.user.username);
        }
      },
      loginWith({ token: nextToken, user: nextUser }) {
        setToken(nextToken || '');
        setUser(nextUser || null);

        if (nextToken) localStorage.setItem('ac_token', nextToken);
        else localStorage.removeItem('ac_token');

        if (nextUser) {
          localStorage.setItem('ac_user', JSON.stringify(nextUser));
          localStorage.setItem('ac_userId', nextUser.id);
          localStorage.setItem('ac_username', nextUser.username);
        } else {
          localStorage.removeItem('ac_user');
        }
      },
      logout() {
        setToken('');
        setUser(null);
        localStorage.removeItem('ac_token');
        localStorage.removeItem('ac_user');
      },
    }),
    [token, user, isAuthed]
  );

  useEffect(() => {
    if (!token) return;
    value.refresh().catch(() => {});
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
