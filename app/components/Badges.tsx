import { ExclamationCircleIcon } from '@heroicons/react/outline'

type Props = {
  message: string
}

export function ErrorBadge({ message }: Props) {
  return (
    <div className="mb-6 flex items-center rounded-lg bg-red-50 p-3 text-sm text-red-500">
      <ExclamationCircleIcon className="mr-1.5 h-4" /> {message}
    </div>
  )
}
