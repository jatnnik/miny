import {
  Form,
  Link,
  useLoaderData,
  useTransition,
  useActionData,
} from '@remix-run/react'
import {
  type LoaderFunction,
  type MetaFunction,
  type ActionFunction,
  redirect,
  json,
} from '@remix-run/node'
import { useState } from 'react'
import { requireUser } from '~/session.server'
import {
  getDateById,
  removePartnerFromDate,
  updateDate,
} from '~/models/date.server'
import { addDays, isPast, formatDistanceToNow, format } from 'date-fns'
import { de } from 'date-fns/locale'
import { badRequest, onlySpaces, validateDate, validateTime } from '~/utils'
import type { Appointment } from '@prisma/client'

import Container from '~/components/Container'
import Card from '~/components/Card'
import Header from '~/components/dashboard/Header'
import { headingStyles } from '~/components/Heading'
import { ErrorBadge } from '~/components/Badges'
import { SubmitButton } from '~/components/Buttons'
import Input from '~/components/Input'

type User = {
  id: number
  name: string
  email: string
  slug: string | null
}

type LoaderData = {
  user: User
  date: Appointment
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await requireUser(request)
  const id = params.id

  if (typeof id !== 'string' || isNaN(Number(id))) {
    return redirect('/')
  }

  const date = await getDateById(Number(id))

  if (!date || date.userId !== user.id) {
    return redirect('/')
  }

  return json<LoaderData>({ user, date })
}

interface ActionData {
  formError?: string
  errors?: {
    date?: string
    startTime?: string
    endTime?: string
    isGroupDate?: string
    maxParticipants?: string
    note?: string
    partner?: string
  }
  fields?: {
    date: string
    startTime: string
    endTime: string | null
    isGroupDate: boolean
    maxParticipants: number | null
    note: string | null
    isFlexible: boolean
    partner: string | null
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  // Action: save
  if (formData.get('action') === 'save') {
    const id = formData.get('id')
    const date = formData.get('date')
    const startTime = formData.get('startTime')
    const endTime = formData.get('endTime')
    const isGroupDate = formData.get('isGroupDate')
    const maxParticipants = formData.get('maxParticipants')
    const note = formData.get('note')
    const flexible = formData.get('flexibleTime')
    const partner = formData.get('partner')

    if (
      typeof date !== 'string' ||
      typeof startTime !== 'string' ||
      typeof id !== 'string' ||
      isNaN(Number(id))
    ) {
      return badRequest<ActionData>({
        formError: 'Pflichtfelder wurden nicht ausgefüllt',
      })
    }

    let fields = {
      id: Number(id),
      date,
      startTime,
      endTime: typeof endTime === 'string' ? endTime : null,
      isGroupDate: isGroupDate === 'on',
      maxParticipants:
        typeof maxParticipants === 'string' ? parseInt(maxParticipants) : null,
      note: typeof note === 'string' ? note : null,
      isFlexible: flexible === 'on',
      partner: typeof partner === 'string' ? partner : null,
    }

    // Validate date
    if (!validateDate(date)) {
      return badRequest<ActionData>({
        fields,
        errors: {
          date: 'Ungültiges Datum',
        },
      })
    }

    if (isPast(new Date(date))) {
      return badRequest<ActionData>({
        fields,
        errors: {
          date: 'Ungültiges Datum (zu früh)',
        },
      })
    }

    fields.date = new Date(date).toISOString()

    // Validate start and end time
    if (!fields.isFlexible && !validateTime(fields.startTime)) {
      return badRequest<ActionData>({
        fields,
        errors: {
          startTime: 'Ungültige Uhrzeit',
        },
      })
    }

    if (fields.isFlexible && onlySpaces(fields.startTime)) {
      return badRequest<ActionData>({
        fields,
        errors: {
          startTime: 'Ungültiges Format',
        },
      })
    } else {
      // Remove any whitespace at start and end
      fields.startTime = fields.startTime.trim()
    }

    if (fields.endTime && !validateTime(fields.endTime)) {
      return badRequest<ActionData>({
        fields,
        errors: {
          endTime: 'Ungültige Uhrzeit',
        },
      })
    }

    if (fields.endTime && fields.endTime < fields.startTime) {
      return badRequest<ActionData>({
        fields,
        errors: {
          endTime: 'Früher als Start',
        },
      })
    }

    // Validate maxParticipants
    if (fields.maxParticipants) {
      if (isNaN(fields.maxParticipants)) {
        return badRequest<ActionData>({
          fields,
          errors: {
            maxParticipants: 'Keine gültige Zahl',
          },
        })
      }
      if (fields.maxParticipants > 100) {
        return badRequest<ActionData>({
          fields,
          errors: {
            maxParticipants: 'Max. 100 erlaubt',
          },
        })
      }
    }

    await updateDate(fields)
    return redirect('/')
  }

  // Action: Remove partner
  if (formData.get('action') === 'remove-partner') {
    const id = formData.get('id')
    if (typeof id !== 'string' || isNaN(Number(id))) {
      return badRequest<ActionData>({
        formError: 'Ungültige ID',
      })
    }

    await removePartnerFromDate(Number(id))
    return redirect('/')
  }
}

export const meta: MetaFunction = () => {
  return {
    title: 'Termin bearbeiten',
  }
}

export default function EditDate() {
  const { user, date } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const transition = useTransition()
  const [isGroupDate, setIsGroupdate] = useState(date.isGroupDate)
  const [fixedStart, setFixedStart] = useState(!date.isFlexible)
  const [selfAssignPartner, setSelfAssignPartner] = useState(
    typeof date.partnerName === 'string'
  )

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const updatedAt = formatDistanceToNow(new Date(date.updatedAt), {
    locale: de,
    addSuffix: true,
  })

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Card withMarginTop>
          <h1 className={headingStyles}>Termin bearbeiten</h1>

          <p className="mt-4 text-sm italic text-slate-500">
            Letzte Änderung: {updatedAt}
          </p>

          <Form className="mt-4" method="post">
            {actionData?.formError ? (
              <ErrorBadge message={actionData.formError} />
            ) : null}
            <fieldset disabled={transition.state === 'submitting'}>
              <div>
                <Input
                  name="date"
                  id="date"
                  label="Datum*"
                  type="date"
                  min={tomorrow}
                  defaultValue={new Date(date.date).toLocaleDateString('en-CA')}
                  required
                  validationError={actionData?.errors?.date}
                />
              </div>

              <div className="mt-6 flex items-center">
                <input
                  id="flexibleTime"
                  name="flexibleTime"
                  type="checkbox"
                  defaultChecked={!fixedStart}
                  onChange={() => setFixedStart(!fixedStart)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                />
                <label htmlFor="flexibleTime" className="ml-2 block">
                  Flexible Zeit
                </label>
              </div>

              <div className="mt-4 flex space-x-4">
                <div className="w-full">
                  <Input
                    name="startTime"
                    id="startTime"
                    label={fixedStart ? 'Von*' : 'Zeit*'}
                    type={fixedStart ? 'time' : 'text'}
                    placeholder={!fixedStart ? 'Vormittags' : ''}
                    defaultValue={date.startTime}
                    validationError={actionData?.errors?.startTime}
                    required
                  />
                </div>
                {fixedStart ? (
                  <div className="w-full">
                    <Input
                      name="endTime"
                      id="endTime"
                      label="Bis"
                      type="time"
                      defaultValue={date.endTime || undefined}
                      validationError={actionData?.errors?.endTime}
                    />
                  </div>
                ) : null}
              </div>

              {!selfAssignPartner && (
                <div className="mt-6 flex items-center">
                  <input
                    id="groupDate"
                    name="isGroupDate"
                    type="checkbox"
                    defaultChecked={isGroupDate}
                    onChange={e => setIsGroupdate(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="groupDate" className="ml-2 block">
                    Gruppentermin
                  </label>
                </div>
              )}

              {isGroupDate && (
                <div className="mt-4">
                  <Input
                    label="Wie viele sollen mitmachen können? (Max. 100)*"
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min={2}
                    max={100}
                    defaultValue={date.maxParticipants || 2}
                    pattern="[0-9]"
                    validationError={actionData?.errors?.maxParticipants}
                    required
                  />
                </div>
              )}

              <div className="mt-4">
                <Input
                  label="Notiz"
                  id="note"
                  name="note"
                  type="text"
                  defaultValue={date.note || undefined}
                  validationError={actionData?.errors?.note}
                />
              </div>

              {!isGroupDate && !date.isAssigned && (
                <div className="mt-6 flex items-center">
                  <input
                    id="selfAssignedPartner"
                    name="selfAssignedPartner"
                    type="checkbox"
                    defaultChecked={selfAssignPartner}
                    onChange={() => setSelfAssignPartner(!selfAssignPartner)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="selfAssignedPartner" className="ml-2 block">
                    Partner eintragen
                  </label>
                </div>
              )}

              {selfAssignPartner && (
                <div className="mt-4">
                  <Input
                    label="Partner*"
                    id="partner"
                    name="partner"
                    type="text"
                    defaultValue={date.partnerName || undefined}
                    validationError={actionData?.errors?.partner}
                    required
                  />
                </div>
              )}

              {date.isAssigned && !date.isGroupDate && (
                <button
                  className="mt-4 text-sm font-medium text-red-700 hover:text-red-800"
                  type="submit"
                  name="action"
                  value="remove-partner"
                >
                  Partner entfernen
                </button>
              )}

              <input type="hidden" name="id" value={date.id} />
            </fieldset>

            <div className="mt-8 flex items-center justify-between">
              <Link to="/" className="text-sm underline underline-offset-1">
                Zurück
              </Link>
              <SubmitButton
                type="submit"
                name="action"
                value="save"
                title="Speichern"
                disabled={transition.state === 'submitting'}
                label={
                  transition.state === 'submitting'
                    ? 'Speichert...'
                    : 'Speichern'
                }
              />
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  )
}
