import { Link, useNavigate } from 'react-router-dom';
import { useDeleteProjectMutation, useGetProjectsQuery } from '../../services/projectApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import ProjectForm from '../projects/ProjectForm';
import { useDebounce } from '../../hooks/useDebounce';

export default function Dashboard() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'asc'|'desc'>('asc');
  const dq = useDebounce(q, 400);
  const dstatus = useDebounce(status, 400);
  const dsort = useDebounce(sort, 400);
  const { data, isLoading, refetch } = useGetProjectsQuery({ q: dq || undefined, status: dstatus || undefined, sort: dsort });
  const [del] = useDeleteProjectMutation();
  const navigate = useNavigate();
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [openEditProject, setOpenEditProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const onDelete = async (id: string) => {
    if (!confirm('Delete project?')) return;
    try {
      await del(id).unwrap();
      toast.success('Project deleted');
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <button className="btn-primary" onClick={() => setOpenCreateProject(true)}>Create Project</button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="grid md:grid-cols-4 gap-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." className="input md:col-span-2 w-full" aria-label="Search projects" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="">All Status</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="input">
              <option value="asc">Start Date Asc</option>
              <option value="desc">Start Date Desc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table">
            <thead className="bg-gray-50">
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
              )}
              {data?.items?.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">{new Date(p.startDate).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{p.endDate ? new Date(p.endDate).toLocaleDateString() : '-'}</td>
                  <td className="px-3 py-2 space-x-2">
                    <button className="btn-secondary" onClick={() => navigate(`/projects/${p._id}/board`)}>Board</button>
                    <button className="btn-secondary" onClick={() => navigate(`/projects/${p._id}`)}>View</button>
                    <button className="btn-secondary" onClick={() => { setSelectedProject(p); setOpenEditProject(true); }}>Edit</button>
                    <button className="btn-danger" onClick={() => onDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!isLoading && (!data || data.items.length === 0) && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No projects</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={openCreateProject} title="Create Project" onClose={() => setOpenCreateProject(false)} size="lg">
        <ProjectForm inModal onClose={() => setOpenCreateProject(false)} onSaved={() => { setOpenCreateProject(false); refetch(); }} />
      </Modal>

      <Modal open={openEditProject} title="Edit Project" onClose={() => { setOpenEditProject(false); setSelectedProject(null); }} size="lg">
        {selectedProject && (
          <ProjectForm inModal projectOverride={selectedProject} onClose={() => { setOpenEditProject(false); setSelectedProject(null); }} onSaved={() => { setOpenEditProject(false); setSelectedProject(null); refetch(); }} />
        )}
      </Modal>
    </div>
  );
}
