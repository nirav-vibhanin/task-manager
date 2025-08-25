import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useStore';
import { logout } from '../features/auth/authSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-[var(--sidebar-width)] bg-white/90 backdrop-blur border-r min-h-screen">
      <div className="h-14 flex items-center px-4 font-semibold border-b text-gray-700">Menu</div>
      <nav className="p-2 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md transition-colors hover:bg-gray-100 text-gray-700 ${
              isActive ? 'bg-gray-100 font-medium text-gray-900' : ''
            }`
          }
        >
          Dashboard
        </NavLink>
      </nav>
      <div className="mt-auto p-3 border-t">
        <button onClick={onLogout} className="w-full btn-danger text-base py-3">Logout</button>
      </div>
    </aside>
  );
}
