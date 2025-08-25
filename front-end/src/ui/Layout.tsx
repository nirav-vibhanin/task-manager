import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { logout } from '../features/auth/authSlice';
import Sidebar from './Sidebar';

export default function Layout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur border-b flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="font-semibold tracking-tight">Task Manager</Link>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-600">{user?.name}</span>
              <button onClick={onLogout} className="btn-secondary text-sm">Logout</button>
            </div>
          </div>
        </header>
        <main className="w-full max-w-7xl mx-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
