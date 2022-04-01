import { DateWithParticipants } from '~/models/date.server'
import { formatDate } from '~/utils'

export default function DateSlot({ date }: { date: DateWithParticipants }) {
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
      {/* <div>
        {date.isAssigned ? (
          <Form
            method="post"
            onSubmit={event => {
              if (
                !window.confirm('Möchtest du diesen Termin wirklich löschen?')
              ) {
                event.preventDefault()
              }
            }}
          >
            <input type="hidden" name="_method" value="delete" />
            <input type="hidden" name="id" value={date.id} />
            <button
              className="opacity-50 transition-opacity duration-75 hover:opacity-100 disabled:opacity-25"
              title="Löschen"
              aria-label="Termin löschen"
              type="submit"
              disabled={transition.state === 'submitting'}
            >
              <TrashIcon className="h-4" />
            </button>
          </Form>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to={`/edit?id=${date.id}`}>
              <button
                className="opacity-50 transition-opacity duration-75 hover:opacity-100"
                title="Bearbeiten"
                aria-label="Termin bearbeiten"
              >
                <PencilIcon className="h-4" />
              </button>
            </Link>
            <Form
              method="post"
              onSubmit={event => {
                if (
                  !window.confirm('Möchtest du diesen Termin wirklich löschen?')
                ) {
                  event.preventDefault()
                }
              }}
            >
              <input type="hidden" name="_method" value="delete" />
              <input type="hidden" name="id" value={date.id} />
              <button
                className="opacity-50 transition-opacity duration-75 hover:opacity-100 disabled:opacity-25"
                title="Löschen"
                aria-label="Termin löschen"
                type="submit"
                disabled={transition.state === 'submitting'}
              >
                <TrashIcon className="h-4" />
              </button>
            </Form>
          </div>
        )}
      </div> */}
    </div>
  )
}
