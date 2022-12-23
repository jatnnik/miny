import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import React from "react"

export const toast = cva(["rounded-md", "p-2", "font-medium", "text-sm"], {
  variants: {
    variant: {
      success: "bg-green-50 text-green-700",
      error: "bg-rose-50 text-rose-700",
    },
  },
  defaultVariants: {
    variant: "success",
  },
})

type ToastProps = VariantProps<typeof toast>
interface Props extends ToastProps {
  className?: string
}

function Toast({
  children,
  variant,
  className,
}: React.PropsWithChildren<Props>) {
  return <div className={toast({ variant, class: className })}>{children}</div>
}

export default Toast
