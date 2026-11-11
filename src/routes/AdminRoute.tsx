
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Not logged in: return to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role cannot be verified or is not admin: return home.
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
