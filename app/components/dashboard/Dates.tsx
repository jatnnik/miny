import type { Date as DateType } from '~/models/date.server'
import {
  PlusIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/outline'
import Card from '../Card'
import { headingStyles } from '../Heading'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  })

function DateSlot({ date }: { date: DateType }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <span
          className={`mb-1 block font-medium ${
            date.isAssigned ? 'text-amber-900' : 'text-red-700'
          }`}
        >
          {formatDate(date.date.toString())}, {date.startTime}
          {date.endTime && `–${date.endTime}`}
        </span>

        {date.isGroupDate && (
          <span className="flex items-center">
            <UserGroupIcon className="mr-1 h-4" /> Teilnehmer:{' '}
            {date.participants ?? 0}/{date.maxParticipants}
          </span>
        )}

        {date.isAssigned && (
          <span className="block">Mit: {date.partnerName}</span>
        )}

        {date.note && (
          <span className="mt-1 block italic text-slate-500">
            Notiz: {date.note}
          </span>
        )}
      </div>
      <div>
        <button className="opacity-50 transition-opacity duration-75 hover:opacity-100">
          {date.isAssigned ? (
            <TrashIcon className="h-4" />
          ) : (
            <PencilIcon className="h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export default function Dates({ dates }: { dates: DateType[] }) {
  const hasDates = dates.length > 0

  return (
    <Card withMarginTop>
      <div className="flex items-center justify-between">
        <h2 className={headingStyles}>Deine Termine</h2>
        <button className="flex items-center rounded-md border border-transparent bg-slate-500 px-4 py-2 pl-3 text-xs font-semibold uppercase tracking-widest text-white ring-slate-300 transition duration-75 ease-in-out hover:bg-slate-400 focus:border-slate-600 focus:outline-none focus:ring active:bg-slate-600 disabled:opacity-25">
          <PlusIcon className="mr-2 h-3.5" /> Neuer Termin
        </button>
      </div>
      {!hasDates && (
        <p className="mt-4">Du hast aktuell keine Termine eingetragen.</p>
      )}

      {hasDates && (
        <div className="mt-2 divide-y divide-dashed">
          {dates.map(date => (
            <DateSlot date={date} key={date.id} />
          ))}
        </div>
      )}
    </Card>
  )
}
