import { ExclamationCircleIcon } from "@heroicons/react/20/solid"

export function ErrorBadge({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-center rounded-lg bg-rose-50 p-3 text-sm text-rose-500">
      <ExclamationCircleIcon className="mr-1.5 h-4" /> {message}
    </div>
  )
}
