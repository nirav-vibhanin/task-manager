import { useField } from 'formik';
import { useState } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
}

export default function TextField({ label, ...props }: Props) {
  const [field, meta] = useField(props.name);
  const hasError = meta.touched && meta.error;
  const isPassword = props.type === 'password';
  const [show, setShow] = useState(false);
  const inputType = isPassword && show ? 'text' : props.type;

  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...field}
          {...props}
          type={inputType}
          className={`input ${isPassword ? 'pr-10' : ''} ${hasError ? 'border-red-500 focus:ring-red-500/40' : ''}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            aria-label={show ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {show ? (
              // Eye-off icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4.5-9-7 0-1.004.678-2.383 1.88-3.706m3.084-2.25A9.966 9.966 0 0112 5c5 0 9 4.5 9 7 0 .86-.36 1.95-1.06 3.02M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.879" />
              </svg>
            ) : (
              // Eye icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      {hasError ? <p className="text-xs text-red-600 mt-0.5">{meta.error}</p> : null}
    </div>
  );
}
