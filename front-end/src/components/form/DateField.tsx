import { useField } from 'formik';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export default function DateField({ label, ...props }: Props) {
  const [field, meta] = useField(props.name);
  const hasError = meta.touched && meta.error;
  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-700">{label}</label>
      <input type="date" {...field} {...props} className={`input ${hasError ? 'border-red-500 focus:ring-red-500/40' : ''}`} />
      {hasError ? <p className="text-xs text-red-600 mt-0.5">{meta.error}</p> : null}
    </div>
  );
}
