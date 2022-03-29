import { useState } from 'react'
import { Form, useActionData, useTransition } from 'remix'
import { Dialog } from '@headlessui/react'
import type { DateWithParticipants } from '~/models/date.server'
import type { CreateDateActionData } from '~/routes'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline'
import Card from '../Card'
import { headingStyles } from '../Heading'
import Input from '../Input'

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
    <div className="flex justify-between py-4">
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
          <button
            className="opacity-50 transition-opacity duration-75 hover:opacity-100"
            title="Bearbeiten"
            aria-label="Termin bearbeiten"
          >
            <PencilIcon className="h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dates({ dates }: { dates: DateWithParticipants[] }) {
  const transition = useTransition()
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [isGroupDate, setIsGroupDate] = useState(false)
  const hasDates = dates.length > 0

  return (
    <Card withMarginTop>
      {/* TODO: Move to /new route */}
      <Dialog
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div className="relative mx-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-sm sm:max-w-md">
            <Dialog.Title className={headingStyles}>Neuer Termin</Dialog.Title>

            <Form className="mt-4" method="post">
              <fieldset disabled={transition.state === 'submitting'}>
                <div>
                  <Input
                    name="date"
                    id="date"
                    label="Datum"
                    type="date"
                    defaultValue={new Date().toLocaleDateString('en-CA')}
                    required
                  />
                </div>

                <div className="mt-4 flex space-x-4">
                  <div className="w-full">
                    <Input
                      name="startTime"
                      id="startTime"
                      label="Von"
                      type="time"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      name="endTime"
                      id="endTime"
                      label="Bis"
                      type="time"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center">
                  <input
                    id="groupDate"
                    name="isGroupDate"
                    type="checkbox"
                    onChange={e => setIsGroupDate(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="groupDate" className="ml-2 block">
                    Gruppentermin
                  </label>
                </div>

                {isGroupDate && (
                  <div className="mt-4">
                    <Input
                      label="Wie viele sollen mitmachen können?"
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min={2}
                      defaultValue={2}
                      pattern="[0-9]"
                      required
                    />
                  </div>
                )}

                <div className="mt-4">
                  <Input label="Notiz" id="note" name="note" type="text" />
                </div>

                <input type="hidden" name="_method" value="add" />
              </fieldset>

              <div className="mt-8 flex space-x-3">
                <button
                  type="button"
                  title="Abbrechen"
                  className="flex items-center rounded-md border border-transparent bg-red-200 px-3 py-1.5 text-sm font-medium text-red-900 ring-red-200 transition duration-100 ease-in-out hover:bg-red-100 focus:border-red-200 focus:outline-none focus:ring active:bg-red-100 disabled:opacity-25"
                  onClick={() => setModalIsOpen(false)}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  title="Speichern"
                  disabled={transition.state === 'submitting'}
                  className="flex items-center rounded-md border border-transparent bg-slate-700 px-3 py-1.5 text-sm font-medium text-white ring-slate-300 transition duration-100 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-600 disabled:opacity-25"
                >
                  {transition.state === 'submitting'
                    ? 'Speichert...'
                    : 'Speichern'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </Dialog>

      <div className="flex items-center justify-between">
        <h2 className={headingStyles}>Deine Termine</h2>
        <button
          className="flex items-center rounded-md border border-transparent bg-slate-700 px-4 py-2 pl-3 text-xs font-semibold uppercase tracking-widest text-white ring-slate-300 transition duration-75 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-600 disabled:opacity-25"
          onClick={() => setModalIsOpen(true)}
        >
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
