import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import DateField from '../../components/form/DateField';
import { useCreateProjectMutation, useGetProjectByIdQuery, useUpdateProjectMutation } from '../../services/projectApi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

type ProjectFormProps = {
  inModal?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
  projectOverride?: any; // when editing in modal, pass project object to skip fetch
};

const schema = Yup.object({
  name: Yup.string()
    .min(3, 'Project name must be at least 3 characters')
    .required('Project name is required'),
  description: Yup.string()
    .max(1000, 'Description must be at most 1000 characters'),
  startDate: Yup.date()
    .required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be on or after the start date')
    .nullable()
    .transform((curr, orig) => orig === '' ? null : curr),
  status: Yup.mixed<'Pending'|'In Progress'|'Completed'>()
    .oneOf(['Pending','In Progress','Completed'], 'Please select a valid status')
    .required('Status is required')
});

export default function ProjectForm({ inModal, onClose, onSaved, projectOverride }: ProjectFormProps) {
  const { id } = useParams();
  const isEditRoute = Boolean(id);
  const isEdit = isEditRoute || Boolean(projectOverride);
  const { data, isLoading: loadingProject } = useGetProjectByIdQuery(id!, { skip: !isEditRoute || Boolean(projectOverride) });
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const navigate = useNavigate();

  const proj = projectOverride ?? data?.project;
  const initialValues = {
    name: proj?.name || '',
    description: proj?.description || '',
    startDate: proj?.startDate ? String(proj.startDate).substring(0,10) : '',
    endDate: proj?.endDate ? String(proj.endDate).substring(0,10) : '',
    status: (proj?.status as any) || 'Pending'
  };

  return (
    <div className="max-w-3xl">
      {isEditRoute && !projectOverride && loadingProject ? (
        <p>Loading...</p>
      ) : (
        inModal ? (
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={schema}
            onSubmit={async (values) => {
              try {
                if (isEdit) {
                  const targetId = (projectOverride?._id) || id!;
                  await updateProject({ id: targetId, body: values as any }).unwrap();
                  toast.success('Project updated');
                  onSaved && onSaved();
                  onClose && onClose();
                } else {
                  const res = await createProject(values as any).unwrap();
                  toast.success('Project created');
                  onSaved && onSaved();
                  onClose && onClose();
                }
              } catch (e: any) {
                toast.error(e?.data?.message || 'Save failed');
              }
            }}
          >
            {({ isValid }) => (
              <Form className="grid gap-4">
                <div className="grid gap-2">
                  <TextField name="name" label="Project Name" placeholder="Project Alpha (e.g., Mobile App Redesign)" />
                  <TextField name="description" label="Description" placeholder="Describe goals, scope, stakeholders (optional)" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <DateField name="startDate" label="Start Date" />
                  <DateField name="endDate" label="End Date" />
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
                <div className="text-sm text-gray-500">{isEdit ? 'Update the project details' : 'Start a new project'}</div>
                <div>{isEdit ? 'Edit Project' : 'Create Project'}</div>
              </div>
              {isEdit && proj?.status && (
                <span className={`badge ${proj.status === 'Completed' ? 'badge-green' : proj.status === 'In Progress' ? 'badge-blue' : 'badge-amber'}`}>{proj.status}</span>
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
                      const targetId = (projectOverride?._id) || id!;
                      await updateProject({ id: targetId, body: values as any }).unwrap();
                      toast.success('Project updated');
                      navigate(`/projects/${targetId}`);
                    } else {
                      const res = await createProject(values as any).unwrap();
                      const newId = res?.project?._id;
                      toast.success('Project created');
                      navigate(newId ? `/projects/${newId}` : '/');
                    }
                  } catch (e: any) {
                    toast.error(e?.data?.message || 'Save failed');
                  }
                }}
              >
                {({ isValid }) => (
                  <Form className="grid gap-4">
                    <div className="grid gap-2">
                      <TextField name="name" label="Project Name" placeholder="Project Alpha (e.g., Mobile App Redesign)" />
                      <TextField name="description" label="Description" placeholder="Describe goals, scope, stakeholders (optional)" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <DateField name="startDate" label="Start Date" />
                      <DateField name="endDate" label="End Date" />
                      <SelectField name="status" label="Status" options={[{label:'Pending',value:'Pending'},{label:'In Progress',value:'In Progress'},{label:'Completed',value:'Completed'}]} />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                      <button type="submit" disabled={!isValid || creating || updating} className="btn-primary">
                        {creating || updating ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        )
      )}
    </div>
  );
}
