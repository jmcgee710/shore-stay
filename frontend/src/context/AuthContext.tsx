import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type AuthRole = 'HOMEOWNER' | 'PROPERTY_MANAGER' | 'TRIP_PLANNER' | 'HOME_WATCHER';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: AuthRole;
  bookingId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  plannerLogin: (bookingId: string, name: string, pin: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'ss_token';
const API = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:5000');

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.sub || !payload.role) return null;
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      role: payload.role,
      name: payload.name ?? '',
      email: payload.email,
      bookingId: payload.bookingId,
    };
  } catch {
    return null;
  }
}

async function apiFetch(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const decoded = decodeToken(stored);
      if (decoded) {
        setToken(stored);
        setUser(decoded);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((newToken: string): AuthUser => {
    const decoded = decodeToken(newToken)!;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(decoded);
    return decoded;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const data = await apiFetch('/api/auth/login', { email, password });
    return persist(data.token);
  }, [persist]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<AuthUser> => {
    const data = await apiFetch('/api/auth/register', { name, email, password });
    return persist(data.token);
  }, [persist]);

  const plannerLogin = useCallback(async (bookingId: string, name: string, pin: string) => {
    const data = await apiFetch('/api/auth/planner-login', { bookingId, name, pin });
    persist(data.token);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, plannerLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Returns the current auth context. Must be used inside AuthProvider. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
