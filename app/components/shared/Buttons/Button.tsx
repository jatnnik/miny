import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export const button = cva(
  [
    "rounded-md px-4 py-2 font-semibold transition duration-150 ease-in-out disabled:opacity-50",
  ],
  {
    variants: {
      intent: {
        primary: [
          "bg-slate-200",
          "ring-slate-100",
          "hover:bg-slate-300",
          "disabled:pointer-events-none",
          "focus:outline-none",
          "focus:ring",
          "active:bg-slate-300",
        ],
        submit: [
          "bg-slate-700",
          "border",
          "border-transparent",
          "text-white",
          "uppercase",
          "tracking-widest",
          "ring-slate-300",
          "hover:bg-slate-600",
          "focus:outline-none",
          "focus:ring",
          "active:bg-slate-700",
        ],
        warning: [
          "bg-rose-100",
          "text-rose-500",
          "ring-rose-50",
          "hover:bg-rose-200",
          "focus:outline-none",
          "focus:ring",
          "active:bg-rose-200",
        ],
      },
      size: {
        small: "text-xs",
        medium: "text-sm",
      },
      variant: {
        icon: ["inline-flex", "items-center"],
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "medium",
    },
  }
)

export interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  name?: string
  value?: string
  ref?: React.RefObject<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  className,
  intent,
  size,
  variant,
  children,
  ...props
}) => (
  <button
    className={button({ intent, size, variant, class: className })}
    {...props}
  >
    {children}
  </button>
)

export default Button
