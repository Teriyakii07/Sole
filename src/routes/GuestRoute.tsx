
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>;
  }

  if (user && role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user && role === 'customer') {
    return <Navigate to="/" replace />;
  }

  if (user && role === null) {
    return <div className="flex min-h-screen items-center justify-center">
      Unable to verify your account role. Please contact support.
    </div>;
  }

  return <Outlet />;
}
