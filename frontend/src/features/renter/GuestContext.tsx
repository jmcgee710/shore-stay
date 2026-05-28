import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useParams } from 'react-router-dom';
import { get } from '../../lib/api';
import type { BookingData } from './types';

const PLANNER_KEY = 'ss_planner_token';

interface PlannerSession {
  token: string;
  name: string;
  bookingId: string;
}

function decodePlanner(token: string): PlannerSession | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!p.sub || p.role !== 'TRIP_PLANNER' || !p.bookingId) return null;
    if (p.exp && p.exp * 1000 < Date.now()) return null;
    return { token, name: p.name ?? 'Planner', bookingId: p.bookingId };
  } catch {
    return null;
  }
}

interface GuestContextValue {
  booking: BookingData | null;
  loading: boolean;
  error: string | null;
  planner: PlannerSession | null;
  setPlannerToken: (token: string) => void;
  clearPlanner: () => void;
}

const GuestContext = createContext<GuestContextValue | null>(null);

export function GuestProvider({ children }: { children: ReactNode }) {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planner, setPlanner] = useState<PlannerSession | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(PLANNER_KEY);
    if (stored) {
      const decoded = decodePlanner(stored);
      setPlanner(decoded);
      if (!decoded) sessionStorage.removeItem(PLANNER_KEY);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    get<BookingData>(`/api/renter/${token}`)
      .then(setBooking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const setPlannerToken = useCallback((newToken: string) => {
    sessionStorage.setItem(PLANNER_KEY, newToken);
    setPlanner(decodePlanner(newToken));
  }, []);

  const clearPlanner = useCallback(() => {
    sessionStorage.removeItem(PLANNER_KEY);
    setPlanner(null);
  }, []);

  return (
    <GuestContext.Provider value={{ booking, loading, error, planner, setPlannerToken, clearPlanner }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest(): GuestContextValue {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error('useGuest must be used within GuestProvider');
  return ctx;
}
