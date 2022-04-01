import { useState } from 'react'
import { Form } from 'remix'
import { type DateWithParticipants } from '~/models/date.server'
import { formatDate } from '~/utils'
import Input from '../Input'

export default function DateSlot({ date }: { date: DateWithParticipants }) {
  const [showForm, setShowForm] = useState(false)

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
              Gruppentermin ({date.participants.length}/{date.maxParticipants}{' '}
              Teilnehmer)
            </span>
            {date.participants.length > 0 && (
              <div className="mt-3 flex items-center space-x-2">
                <div className="flex -space-x-1 overflow-hidden">
                  {date.participants.slice(0, 4).map((participant, i) => (
                    <div
                      key={i}
                      className="grid h-8 w-8 place-items-center rounded-full bg-slate-300 text-xs font-medium text-slate-700 ring-2 ring-white"
                      title={participant.name}
                    >
                      <span>{participant.name.slice(0, 1)}</span>
                    </div>
                  ))}
                </div>
                {date.participants.length > 4 && (
                  <div className="ml-10 text-sm">
                    +{date.participants.length - 4} weitere
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {date.note && (
          <span className="mt-2 block text-sm italic">Notiz: {date.note}</span>
        )}

        {showForm && (
          <Form className="mt-4 flex items-center space-x-2">
            <fieldset>
              <Input label="Dein Name" name="name" type="text" required />
            </fieldset>
            <button
              className="mt-6 rounded-md border border-transparent bg-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white ring-slate-300 transition duration-150 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-800 disabled:opacity-25"
              type="submit"
            >
              Senden
            </button>
          </Form>
        )}
      </div>
      <div>
        <button
          className="rounded-md border border-transparent bg-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white ring-slate-300 transition duration-150 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-800 disabled:opacity-25"
          onClick={() => setShowForm(!showForm)}
        >
          Eintragen
        </button>
      </div>
    </div>
  )
}
