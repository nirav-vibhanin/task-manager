import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './ui/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import ProjectDetails from './pages/projects/ProjectDetails';
import KanbanBoard from './pages/projects/KanbanBoard';
import AuthGuard from './features/auth/AuthGuard';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/projects/:id', element: <ProjectDetails /> },
      { path: '/projects/:id/board', element: <KanbanBoard /> },
      { path: '*', element: <Navigate to="/" /> }
    ]
  }
]);
