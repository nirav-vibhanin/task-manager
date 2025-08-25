import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetProjectByIdQuery } from '../../services/projectApi';
import { useGetTasksByProjectQuery, useUpdateTaskMutation, Task } from '../../services/taskApi';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import TaskForm from '../tasks/TaskForm';

const STATUSES: Array<Task['status']> = ['Pending', 'In Progress', 'Completed'];

export default function KanbanBoard() {
  const { id } = useParams<{ id: string }>();
  const projectId = id!;
  const { data: projectData, isLoading: loadingProject } = useGetProjectByIdQuery(projectId);
  const { data: tasksData, isLoading: loadingTasks, refetch } = useGetTasksByProjectQuery({ projectId });
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const [localTasks, setLocalTasks] = useState<Task[] | null>(null);
  const [dragOver, setDragOver] = useState<Task['status'] | null>(null);
  const tasks = localTasks ?? tasksData?.items ?? [];
  const [openCreateTask, setOpenCreateTask] = useState(false);
  const [openEditTask, setOpenEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const columns = useMemo(() => {
    const map: Record<string, Task[]> = { 'Pending': [], 'In Progress': [], 'Completed': [] };
    tasks.forEach(t => { map[t.status]?.push(t); });
    return map;
  }, [tasks]);

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/task-id', taskId);
  };

  const onDrop = async (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/task-id');
    if (!taskId) return;

    const oldTasks = tasks;
    // Optimistic update
    const next = oldTasks.map(t => t._id === taskId ? { ...t, status } : t);
    setLocalTasks(next);

    try {
      await updateTask({ id: taskId, body: { status } as any }).unwrap();
      toast.success('Status updated');
      // Refetch to sync
      refetch();
      setLocalTasks(null);
      setDragOver(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update');
      setLocalTasks(oldTasks);
      setDragOver(null);
    }
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const statusBadgeClass = (s: Task['status']) =>
    s === 'Completed' ? 'badge badge-green' : s === 'In Progress' ? 'badge badge-blue' : 'badge badge-amber';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{loadingProject ? 'Loading…' : projectData?.project?.name || 'Project'}</h1>
          <p className="text-gray-600 text-sm">Kanban Board</p>
        </div>
        <div className="space-x-2">
          <Link to={`/projects/${projectId}`} className="btn-secondary">Back to Details</Link>
          <button className="btn-primary" onClick={() => setOpenCreateTask(true)}>Add Task</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {STATUSES.map((status) => (
          <div key={status} className={`kanban-col ${dragOver === status ? 'kanban-drop-target' : ''}`}
               onDragOver={allowDrop}
               onDragEnter={() => setDragOver(status)}
               onDragLeave={() => setDragOver(null)}
               onDrop={(e) => onDrop(e, status)}>
            <div className="kanban-col-header">
              <span>{status}</span>
              <span className="text-xs text-gray-500">{columns[status]?.length ?? 0}</span>
            </div>
            <div className="kanban-col-body">
              {loadingTasks && tasks.length === 0 && (
                <div className="text-sm text-gray-500">Loading…</div>
              )}
              {(columns[status] || []).map((t) => (
                <div key={t._id}
                     className={`task-card ${updating ? 'opacity-70' : ''}`}
                     draggable
                     onDragStart={(e) => onDragStart(e, t._id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="task-title">{t.title}</div>
                    <span className={statusBadgeClass(t.status)}>{t.status}</span>
                  </div>
                  <div className="task-meta">
                    <span className="chip">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</span>
                    <div className="flex gap-3">
                      {t.status !== 'Completed' && (
                        <button
                          className="text-amber-600 text-xs"
                          onClick={() => { setSelectedTask(t); setOpenEditTask(true); }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!loadingTasks && (columns[status]?.length ?? 0) === 0) && (
                <div className="text-sm text-gray-400">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={openCreateTask} title="Create Task" onClose={() => setOpenCreateTask(false)} size="lg">
        <TaskForm inModal projectIdOverride={projectId} onClose={() => setOpenCreateTask(false)} onSaved={() => { setOpenCreateTask(false); refetch(); }} />
      </Modal>

      <Modal open={openEditTask} title="Edit Task" onClose={() => { setOpenEditTask(false); setSelectedTask(null); }} size="lg">
        {selectedTask && (
          <TaskForm
            inModal
            projectIdOverride={projectId}
            taskOverride={selectedTask}
            onClose={() => { setOpenEditTask(false); setSelectedTask(null); }}
            onSaved={() => { setOpenEditTask(false); setSelectedTask(null); refetch(); }}
          />
        )}
      </Modal>
    </div>
  );
}
