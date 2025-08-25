import { useField } from 'formik';

interface Option { label: string; value: string }
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  options: Option[];
}

export default function SelectField({ label, options, ...props }: Props) {
  const [field, meta] = useField(props.name);
  const hasError = meta.touched && meta.error;
  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-700">{label}</label>
      <select {...field} {...props} className={`input ${hasError ? 'border-red-500 focus:ring-red-500/40' : ''}`}>
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hasError ? <p className="text-xs text-red-600 mt-0.5">{meta.error}</p> : null}
    </div>
  );
}
