import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  validationError?: string | undefined
}

const Input = ({ name, label, validationError, ...props }: InputProps) => {
  return (
    <>
      <label htmlFor={name} className='text-sm font-medium block mb-0.5'>
        {label}
      </label>

      <input
        id={name}
        name={name}
        className='rounded-lg shadow-sm border-slate-300 focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50 block mt-1 w-full'
        {...props}
      />

      {validationError ? (
        <p className='text-xs text-red-400 mt-1.5 font-medium' role='alert'>
          {validationError}
        </p>
      ) : null}
    </>
  )
}

export default Input
