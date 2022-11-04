import clsx from "clsx"
import { type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  validationError?: string
  name: string
}

export const labelClasses = "mb-0.5 block text-sm"
export const inputClasses =
  "mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50 text-left font-sans"
export const errorClasses = "mt-1.5 text-sm font-medium text-rose-500"

export default function Input({
  name,
  label,
  validationError,
  ...props
}: InputProps) {
  return (
    <>
      <label htmlFor={name} className={labelClasses}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        className={clsx(inputClasses, props.className)}
        aria-invalid={validationError ? true : undefined}
        aria-describedby={`${name}-error`}
        {...props}
      />

      {validationError ? (
        <p className={errorClasses} role="alert" id={`${name}-error`}>
          {validationError}
        </p>
      ) : null}
    </>
  )
}
