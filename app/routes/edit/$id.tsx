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
import { getDateById, updateDate } from '~/models/date.server'
import { addDays, isPast, formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

import Container from '~/components/Container'
import Card from '~/components/Card'
import Header from '~/components/dashboard/Header'
import { headingStyles } from '~/components/Heading'
import { ErrorBadge } from '~/components/Badges'
import { SubmitButton } from '~/components/Buttons'
import Input from '~/components/Input'
import { badRequest, validateDate, validateTime } from '~/utils'
import { Appointment } from '@prisma/client'

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

  if (!date || date.isAssigned || date.userId !== user.id) {
    return redirect('/')
  }

  return json({ user, date })
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
  }
  fields?: {
    date: string
    startTime: string
    endTime: string | null
    isGroupDate: boolean
    maxParticipants: number | null
    note: string | null
    isFlexible: boolean
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const id = formData.get('id')
  const date = formData.get('date')
  const startTime = formData.get('startTime')
  const endTime = formData.get('endTime')
  const isGroupDate = formData.get('isGroupDate')
  const maxParticipants = formData.get('maxParticipants')
  const note = formData.get('note')
  const flexible = formData.get('flexibleTime')

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
  if (!fields.isFlexible && !validateTime(startTime)) {
    return badRequest<ActionData>({
      fields,
      errors: {
        startTime: 'Ungültige Uhrzeit',
      },
    })
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
  if (fields.maxParticipants && isNaN(fields.maxParticipants)) {
    return badRequest<ActionData>({
      fields,
      errors: {
        maxParticipants: 'Keine gültige Zahl',
      },
    })
  }

  await updateDate(fields)
  return redirect('/')
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

  const tomorrow = addDays(new Date(), 1).toLocaleDateString('en-CA')

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Card withMarginTop>
          <h1 className={headingStyles}>Termin bearbeiten</h1>

          <p className="mt-4 text-sm italic text-slate-500">
            Letzte Änderung:{' '}
            {formatDistanceToNow(new Date(date.updatedAt), {
              locale: de,
              addSuffix: true,
            })}
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

              {isGroupDate && (
                <div className="mt-4">
                  <Input
                    label="Wie viele sollen mitmachen können?*"
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min={2}
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

              <input type="hidden" name="id" value={date.id} />
            </fieldset>

            <div className="mt-8 flex items-center justify-between">
              <Link to="/" className="text-sm underline underline-offset-1">
                Zurück
              </Link>
              <SubmitButton
                type="submit"
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
