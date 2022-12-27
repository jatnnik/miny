import React from "react"

interface Props {
  className?: string
}

export default function Card({
  children,
  className,
}: React.PropsWithChildren<Props>) {
  return (
    <div
      className={`rounded-md bg-white p-5 shadow-md ring-1 ring-black ring-opacity-5 sm:p-7 ${className}`}
    >
      {children}
    </div>
  )
}
