import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { homeForRole } from '../utils/roles';

export function ProtectedRoute({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { role, logout } = useAuth();
  if (!role) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!roles.includes(role)) {
    const redirectTo = homeForRole(role);
    if (redirectTo === '/admin/login') {
      logout();
    }
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
}