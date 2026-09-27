import { useAuth } from '../../contexts/AuthContext';

export default function RoleGuard({ allowedRoles, children, fallback = null }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
}
