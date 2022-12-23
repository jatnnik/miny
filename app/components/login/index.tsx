import type { PropsWithChildren } from "react"

export function LoginWrapper({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-6 sm:justify-center sm:px-0 sm:pt-0">
      {children}
    </div>
  )
}

export function LoginCard({ children }: PropsWithChildren) {
  return (
    <div className="w-full rounded-md bg-white p-6 shadow-md ring-1 ring-black ring-opacity-5 sm:max-w-md">
      {children}
    </div>
  )
}
