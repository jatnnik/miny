import { Link } from 'remix'
import type { DateWithParticipants } from '~/models/date.server'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline'
import Card from '../Card'
import { headingStyles } from '../Heading'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  })

function DateSlot({ date }: { date: DateWithParticipants }) {
  const handleDelete = () => {
    if (window.confirm('Willst du diesen Termin wirklich löschen?')) {
      console.log('delete date')
    }
  }

  return (
    <div className="flex justify-between pt-4">
      <div>
        <span className="mb-1 block font-medium text-amber-800">
          {formatDate(date.date.toString())}, {date.startTime}
          {date.endTime && `–${date.endTime}`}
        </span>

        {date.isGroupDate && (
          <>
            <span className="block text-sm italic">
              Gruppentermin ({date.participants.length}/{date.maxParticipants})
            </span>
            {date.participants.length > 0 && (
              <ul className="mt-1 list-inside list-disc">
                {date.participants.map((participant, i) => (
                  <li key={i}>{participant.name}</li>
                ))}
              </ul>
            )}
          </>
        )}

        {!date.isGroupDate &&
          (date.isAssigned ? (
            <span className="block">Mit: {date.partnerName}</span>
          ) : (
            <span className="block italic">Noch frei</span>
          ))}

        {date.note && (
          <span className="mt-2 block text-sm italic text-slate-500">
            Notiz: {date.note}
          </span>
        )}
      </div>
      <div>
        {date.isAssigned ? (
          <button
            className="opacity-50 transition-opacity duration-75 hover:opacity-100"
            onClick={handleDelete}
            title="Löschen"
            aria-label="Termin löschen"
          >
            <TrashIcon className="h-4" />
          </button>
        ) : (
          <div>
            <button
              className="mr-2 opacity-50 transition-opacity duration-75 hover:opacity-100"
              title="Bearbeiten"
              aria-label="Termin bearbeiten"
            >
              <PencilIcon className="h-4" />
            </button>
            <button
              className="opacity-50 transition-opacity duration-75 hover:opacity-100"
              onClick={handleDelete}
              title="Löschen"
              aria-label="Termin löschen"
            >
              <TrashIcon className="h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dates({ dates }: { dates: DateWithParticipants[] }) {
  const hasDates = dates.length > 0

  return (
    <Card withMarginTop>
      <div className="flex items-center justify-between">
        <h2 className={headingStyles}>Deine Termine</h2>
        <Link
          className="flex items-center rounded-md border border-transparent bg-slate-700 px-4 py-2 pl-3 text-xs font-semibold uppercase tracking-widest text-white ring-slate-300 transition duration-75 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-600 disabled:opacity-25"
          to="/new"
        >
          <PlusIcon className="mr-2 h-3.5" /> Neuer Termin
        </Link>
      </div>
      {!hasDates && (
        <p className="mt-4">Du hast aktuell keine Termine eingetragen.</p>
      )}

      {hasDates && (
        <div className="mt-2 flex flex-col space-y-4 divide-y divide-dashed">
          {dates.map(date => (
            <DateSlot date={date} key={date.id} />
          ))}
        </div>
      )}
    </Card>
  )
}
