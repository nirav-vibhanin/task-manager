import { Link, useParams } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../../services/projectApi';
import { useGetTasksByProjectQuery, useDeleteTaskMutation } from '../../services/taskApi';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import TaskForm from '../tasks/TaskForm';
import ProjectForm from './ProjectForm';
import { useDebounce } from '../../hooks/useDebounce';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetProjectByIdQuery(id!);
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 400);
  const { data: tasksData, isLoading: loadingTasks, refetch } = useGetTasksByProjectQuery({ projectId: id!, q: dq || undefined });
  const [delTask] = useDeleteTaskMutation();
  // Hooks must run on every render, so declare state before any conditional returns
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [openEditTask, setOpenEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const onDeleteTask = async (taskId: string) => {
    if (!confirm('Delete task?')) return;
    try {
      await delTask({ id: taskId, projectId: id! }).unwrap();
      toast.success('Task deleted');
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || 'Delete failed');
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!data?.project) return <p>Project not found</p>;

  const p = data.project;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{p.name}</h1>
          <p className="text-gray-600 text-sm">Status: {p.status}</p>
        </div>
        <div className="space-x-2">
          <Link to={`/projects/${p._id}/board`} className="btn-secondary">Board</Link>
          <button onClick={() => setOpenEditProject(true)} className="px-3 py-2 rounded border">Edit</button>
          <button onClick={() => setOpenCreateTask(true)} className="px-3 py-2 rounded bg-blue-600 text-white">Add Task</button>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <p className="mb-2 text-sm text-gray-700">{p.description || 'No description'}</p>
        <div className="text-sm text-gray-600">
          <div>Start: {new Date(p.startDate).toLocaleDateString()}</div>
          <div>End: {p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}</div>
        </div>
      </div>

      <div className="bg-white border rounded">
        <div className="p-3 border-b font-medium">Tasks</div>
        <div className="p-3 border-b">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" className="input w-full md:w-1/2" />
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Due</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingTasks && (<tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>)}
            {tasksData?.items?.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-2">{t.title}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                <td className="p-2 space-x-2">
                  {t.status !== 'Completed' && (
                    <button onClick={() => { setSelectedTask(t); setOpenEditTask(true); }} className="text-amber-600">Edit</button>
                  )}
                  <button onClick={() => onDeleteTask(t._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {!loadingTasks && (!tasksData || tasksData.items.length === 0) && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No tasks</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={openCreateTask} title="Create Task" onClose={() => setOpenCreateTask(false)} size="lg">
        <TaskForm inModal projectIdOverride={p._id} onClose={() => setOpenCreateTask(false)} onSaved={() => { setOpenCreateTask(false); refetch(); }} />
      </Modal>

      <Modal open={openEditProject} title="Edit Project" onClose={() => setOpenEditProject(false)} size="lg">
        <ProjectForm inModal projectOverride={p} onClose={() => setOpenEditProject(false)} onSaved={() => { setOpenEditProject(false); }} />
      </Modal>

      <Modal open={openEditTask} title="Edit Task" onClose={() => { setOpenEditTask(false); setSelectedTask(null); }} size="lg">
        {selectedTask && (
          <TaskForm inModal projectIdOverride={p._id} taskOverride={selectedTask} onClose={() => { setOpenEditTask(false); setSelectedTask(null); }} onSaved={() => { setOpenEditTask(false); setSelectedTask(null); refetch(); }} />
        )}
      </Modal>
    </div>
  );
}
