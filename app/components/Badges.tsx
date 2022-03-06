import { ExclamationCircleIcon } from '@heroicons/react/outline'

type Props = {
  message: string
}

export function ErrorBadge({ message }: Props) {
  return (
    <div className='bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center'>
      <ExclamationCircleIcon className='h-4 mr-1.5' /> {message}
    </div>
  )
}
