import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import { useRegisterMutation } from '../../services/authApi';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const schema = Yup.object({
  name: Yup.string()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/\d/, 'Password must include at least 1 number')
    .required('Password is required'),
  gender: Yup.mixed<'Male'|'Female'|'Other'>()
    .oneOf(['Male','Female','Other'], 'Please select a valid gender')
    .required('Gender is required')
});

export default function Register() {
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md card">
        <div className="card-header">Register</div>
        <div className="card-body">
        <Formik
          initialValues={{ name: '', email: '', password: '', gender: '' as any }}
          validationSchema={schema}
          onSubmit={async (values) => {
            try {
              await register(values as any).unwrap();
              toast.success('Registration successful');
              navigate('/login');
            } catch (e: any) {
              toast.error(e?.data?.message || 'Registration failed');
            }
          }}
        >
          {({ isValid }) => (
            <Form className="space-y-4">
              <TextField name="name" label="Name" placeholder="Your name" />
              <TextField name="email" label="Email" type="email" placeholder="you@example.com" />
              <TextField name="password" label="Password" type="password" placeholder="••••••" />
              <SelectField name="gender" label="Gender" options={[{label:'Male', value:'Male'},{label:'Female', value:'Female'},{label:'Other', value:'Other'}]} />
              <button type="submit" disabled={!isValid || isLoading} className="w-full btn-primary">
                {isLoading ? 'Loading...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
        <p className="text-sm text-gray-600 mt-4 px-4 pb-4">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
