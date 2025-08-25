import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import DateField from '../../components/form/DateField';
import { useCreateTaskMutation, useUpdateTaskMutation, useGetTaskByIdQuery } from '../../services/taskApi';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

type TaskFormProps = {
  inModal?: boolean;
  projectIdOverride?: string;
  taskOverride?: any; // when editing, pass task object to skip fetch
  onClose?: () => void;
  onSaved?: () => void;
};

const today = new Date();
const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const schema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .required('Title is required'),
  description: Yup.string()
    .max(500, 'Description must be at most 500 characters'),
  dueDate: Yup.date()
    .min(startOfToday, 'Due date must be today or later')
    .nullable()
    .transform((curr, orig) => orig === '' ? null : curr),
  status: Yup.mixed<'Pending'|'In Progress'|'Completed'>()
    .oneOf(['Pending','In Progress','Completed'], 'Please select a valid status')
    .required('Status is required')
});

export default function TaskForm({ inModal, projectIdOverride, taskOverride, onClose, onSaved }: TaskFormProps) {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as any;
  // Determine edit mode: either editing via route (/tasks/:id/edit) or via modal with override
  const isEditRoute = typeof location?.pathname === 'string' && location.pathname.includes('/tasks/');
  const task = taskOverride ?? location.state?.task;
  const isEdit = (Boolean(id) && isEditRoute) || Boolean(taskOverride);
  const { data: fetchedTaskData, isLoading: loadingTask } = useGetTaskByIdQuery(id!, { skip: !isEdit || !!task || !!taskOverride });
  const selectedTask = task || fetchedTaskData?.task;
  const _projectId = projectIdOverride || projectId || location.state?.projectId || selectedTask?.project;

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const toDateInput = (value?: string | Date) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      // Normalize to local date (yyyy-mm-dd) without timezone shift
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return String(value).slice(0, 10);
    }
  };

  const initialValues = {
    title: selectedTask?.title || '',
    description: selectedTask?.description || '',
    dueDate: toDateInput(selectedTask?.dueDate as any),
    status: (selectedTask?.status as any) || 'Pending'
  };

  if (isEdit && !task && loadingTask) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl">
      {inModal ? (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={schema}
          onSubmit={async (values) => {
            try {
              if (isEdit) {
                await updateTask({ id: id!, body: { ...(values as any), project: _projectId } }).unwrap();
                toast.success('Task updated');
              } else {
                await createTask({ ...(values as any), project: _projectId }).unwrap();
                toast.success('Task created');
              }
              if (inModal) {
                onSaved && onSaved();
                onClose && onClose();
              } else {
                navigate(`/projects/${_projectId}`);
              }
            } catch (e: any) {
              toast.error(e?.data?.message || 'Save failed');
            }
          }}
        >
          {({ isValid }) => (
            <Form className="grid gap-4">
              <div className="grid gap-2">
                <TextField name="title" label="Task Title" placeholder="Design the new dashboard" />
                <TextField name="description" label="Description" placeholder="Write a clear, short description (optional)" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <DateField name="dueDate" label="Due Date" />
                <SelectField name="status" label="Status" options={[{label:'Pending',value:'Pending'},{label:'In Progress',value:'In Progress'},{label:'Completed',value:'Completed'}]} />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" className="btn-secondary" onClick={() => (inModal ? onClose && onClose() : navigate(-1))}>Cancel</button>
                <button type="submit" disabled={!isValid || creating || updating} className="btn-primary">
                  {creating || updating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">{_projectId ? 'Project' : ''}</div>
              <div>{isEdit ? 'Edit Task' : 'Create Task'}</div>
            </div>
            {isEdit && selectedTask && (
              <span className={`badge ${selectedTask.status === 'Completed' ? 'badge-green' : selectedTask.status === 'In Progress' ? 'badge-blue' : 'badge-amber'}`}>{selectedTask.status}</span>
            )}
          </div>
          <div className="card-body">
            <Formik
              initialValues={initialValues}
              enableReinitialize
              validationSchema={schema}
              onSubmit={async (values) => {
                try {
                  if (isEdit) {
                    await updateTask({ id: id!, body: { ...(values as any), project: _projectId } }).unwrap();
                    toast.success('Task updated');
                  } else {
                    await createTask({ ...(values as any), project: _projectId }).unwrap();
                    toast.success('Task created');
                  }
                  if (inModal) {
                    onSaved && onSaved();
                    onClose && onClose();
                  } else {
                    navigate(`/projects/${_projectId}`);
                  }
                } catch (e: any) {
                  toast.error(e?.data?.message || 'Save failed');
                }
              }}
            >
              {({ isValid }) => (
                <Form className="grid gap-4">
                  <div className="grid gap-2">
                    <TextField name="title" label="Task Title" placeholder="Design the new dashboard" />
                    <TextField name="description" label="Description" placeholder="Write a clear, short description (optional)" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <DateField name="dueDate" label="Due Date" />
                    <SelectField name="status" label="Status" options={[{label:'Pending',value:'Pending'},{label:'In Progress',value:'In Progress'},{label:'Completed',value:'Completed'}]} />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button type="button" className="btn-secondary" onClick={() => (inModal ? onClose && onClose() : navigate(-1))}>Cancel</button>
                    <button type="submit" disabled={!isValid || creating || updating} className="btn-primary">
                      {creating || updating ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
