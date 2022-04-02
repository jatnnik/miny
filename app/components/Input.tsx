import { type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  validationError?: string
  name: string
}

export const labelStyles = 'mb-0.5 block text-sm font-medium'
export const inputStyles =
  'mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50'
export const errorStyles = 'mt-1.5 text-sm font-medium text-red-700'

const Input = ({ name, label, validationError, ...props }: InputProps) => {
  return (
    <>
      <label htmlFor={name} className={labelStyles}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        className={inputStyles}
        aria-invalid={validationError ? true : undefined}
        aria-describedby={`${name}-error`}
        {...props}
      />

      {validationError ? (
        <p className={errorStyles} role="alert" id={`${name}-error`}>
          {validationError}
        </p>
      ) : null}
    </>
  )
}

export default Input
