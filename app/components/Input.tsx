import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  validationError?: string | undefined
}

const Input = ({ name, label, validationError, ...props }: InputProps) => {
  return (
    <>
      <label htmlFor={name} className="mb-0.5 block text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        name={name}
        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
        {...props}
      />

      {validationError ? (
        <p className="mt-1.5 text-xs font-medium text-red-400" role="alert">
          {validationError}
        </p>
      ) : null}
    </>
  )
}

export default Input
