import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '../../components/form/TextField';
import { useLoginMutation } from '../../services/authApi';
import { useAppDispatch } from '../../hooks/useStore';
import { setCredentials } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const schema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

export default function Login() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md card">
        <div className="card-header">Login</div>
        <div className="card-body">
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={schema}
          onSubmit={async (values) => {
            try {
              const res = await login(values).unwrap();
              dispatch(setCredentials(res));
              toast.success('Login successful');
              navigate('/');
            } catch (e: any) {
              toast.error(e?.data?.message || 'Login failed');
            }
          }}
        >
          {({ isValid }) => (
            <Form className="space-y-4">
              <TextField name="email" label="Email" type="email" placeholder="you@example.com" />
              <TextField name="password" label="Password" type="password" placeholder="••••••" />
              <button type="submit" disabled={!isValid || isLoading} className="w-full btn-primary">
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        <p className="text-sm text-gray-600 mt-4 px-4 pb-4">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
        </div>
      </div>
    </div>
  );
}
