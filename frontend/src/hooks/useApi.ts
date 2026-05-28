import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { get, post, put, del } from '../lib/api';

/** Returns API methods pre-bound with the current auth token. */
export function useApi() {
  const { token } = useAuth();
  const t = token ?? undefined;
  return {
    get: useCallback(<T>(path: string) => get<T>(path, t), [t]),
    post: useCallback(<T>(path: string, body: unknown) => post<T>(path, body, t), [t]),
    put: useCallback(<T>(path: string, body: unknown) => put<T>(path, body, t), [t]),
    del: useCallback((path: string) => del(path, t), [t]),
  };
}
