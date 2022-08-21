import { useState } from 'react'
import { Form, useTransition } from '@remix-run/react'
import { type DateWithParticipants } from '~/models/date.server'
import { formatDate } from '~/utils'
import { labelStyles, inputStyles } from '../Input'
import { CalendarIcon, VideoCameraIcon } from '@heroicons/react/outline'

export default function DateSlot({ date }: { date: DateWithParticipants }) {
  const [showForm, setShowForm] = useState(false)
  const transition = useTransition()

  return (
    <div>
      <div
        className={`flex justify-between pt-4 ${
          !date.isGroupDate && !date.note ? 'items-center' : 'items-start'
        }`}
      >
        <div>
          <span className="mb-1 block font-medium text-amber-800 sm:hidden">
            <span className="flex items-center">
              {date.isZoom && <VideoCameraIcon className="mr-1 h-4" />}{' '}
              {formatDate(date.date.toString())}
            </span>
            <span className="text-slate-700">
              {date.startTime}
              {date.endTime && `–${date.endTime}`}
            </span>
          </span>
          <span className="mb-1 hidden font-medium text-amber-800 sm:flex sm:items-center">
            {date.isZoom && <VideoCameraIcon className="mr-1 h-4" />}
            {formatDate(date.date.toString())}, {date.startTime}
            {date.endTime ? `–${date.endTime}` : null}
          </span>

          {date.note && (
            <span className="text-sm italic">Notiz: {date.note}</span>
          )}

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
        </div>
        <div>
          <button
            className={`rounded-md border border-transparent bg-slate-700 px-2.5 py-2 text-xs font-medium uppercase tracking-widest text-white ring-slate-300 transition duration-150 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-800 disabled:opacity-25 ${
              showForm ? 'opacity-50' : ''
            }`}
            onClick={() => setShowForm(!showForm)}
          >
            <CalendarIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showForm && (
        <Form
          className="mt-4 flex items-center space-x-2"
          method="post"
          reloadDocument
        >
          <fieldset
            disabled={transition.state === 'submitting'}
            className="flex-grow"
          >
            <label htmlFor="name" className={labelStyles}>
              Dein Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              autoComplete="given-name"
              className={inputStyles}
              required
            />
          </fieldset>
          <input type="hidden" name="dateId" value={date.id} />
          <button
            className="mt-6 rounded-md border border-transparent bg-green-700 px-4 py-3 text-xs font-medium uppercase tracking-widest text-white ring-slate-300 transition duration-150 ease-in-out hover:bg-green-600 focus:border-green-800 focus:outline-none focus:ring active:bg-green-800 disabled:opacity-25"
            type="submit"
            disabled={transition.state === 'submitting'}
          >
            {transition.state === 'submitting' ? 'Sendet...' : 'Senden'}
          </button>
        </Form>
      )}
    </div>
  )
}
