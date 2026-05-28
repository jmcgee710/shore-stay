import { Navigate } from 'react-router-dom';
import { useAuth, AuthRole } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: AuthRole[];
  redirectTo?: string;
}

/** Redirects unauthenticated users or users without the required role. */
export function ProtectedRoute({ children, roles, redirectTo = '/login' }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to={redirectTo} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
