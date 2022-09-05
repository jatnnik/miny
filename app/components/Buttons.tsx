import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export const SubmitButton = ({ label, ...props }: ButtonProps) => (
  <button
    className="rounded-md border border-transparent bg-slate-700 px-4 py-2 text-xs font-medium uppercase tracking-widest text-white ring-slate-300 transition duration-150 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-800 disabled:opacity-25"
    {...props}
  >
    {label}
  </button>
)
