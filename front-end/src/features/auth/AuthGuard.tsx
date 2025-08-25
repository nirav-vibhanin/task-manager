import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useStore';

export default function AuthGuard({ children }: { children?: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : <Outlet />;
}
