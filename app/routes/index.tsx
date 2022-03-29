import {
  type LoaderFunction,
  useLoaderData,
  json,
  type MetaFunction,
  ActionFunction,
  redirect,
} from 'remix'

import { getUserId, requireUser, requireUserId } from '~/session.server'
import {
  createDate,
  getDatesByUserId,
  type DateWithParticipants,
} from '~/models/date.server'
import type { User } from '~/models/user.server'
import { badRequest, validateDate, validateTime } from '~/utils'

import Container from '~/components/Container'
import Header from '~/components/dashboard/Header'
import Welcome from '~/components/dashboard/Welcome'
import Dates from '~/components/dashboard/Dates'

type LoaderData = { user: User; dates: DateWithParticipants[] }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  const dates = await getDatesByUserId(user.id)
  return json({ user, dates })
}

export interface CreateDateActionData {
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
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const method = formData.get('_method')
  const date = formData.get('date')
  const startTime = formData.get('startTime')
  const endTime = formData.get('endTime')
  const isGroupDate = formData.get('isGroupDate')
  const maxParticipants = formData.get('maxParticipants')
  const note = formData.get('note')

  if (
    typeof method !== 'string' ||
    typeof date !== 'string' ||
    typeof startTime !== 'string'
  ) {
    return badRequest<CreateDateActionData>({
      formError: 'Pflichtfelder wurden nicht ausgefüllt',
    })
  }

  let fields = {
    date,
    startTime,
    endTime: typeof endTime === 'string' ? endTime : null,
    isGroupDate: isGroupDate === 'on',
    maxParticipants:
      typeof maxParticipants === 'string' ? parseInt(maxParticipants) : null,
    note: typeof note === 'string' ? note : null,
  }

  if (method === 'add') {
    // Validate date
    if (!validateDate(date)) {
      return badRequest<CreateDateActionData>({
        fields,
        errors: {
          date: 'Ungültiges Datum',
        },
      })
    } else {
      fields.date = new Date(date).toISOString()
    }

    // Validate start and end time
    if (!validateTime(startTime)) {
      return badRequest<CreateDateActionData>({
        fields,
        errors: {
          startTime: 'Ungültige Uhrzeit',
        },
      })
    }

    if (fields.endTime && !validateTime(fields.endTime)) {
      return badRequest<CreateDateActionData>({
        fields,
        errors: {
          endTime: 'Ungültige Uhrzeit',
        },
      })
    }

    // Validate maxParticipants
    if (fields.maxParticipants && isNaN(fields.maxParticipants)) {
      return badRequest<CreateDateActionData>({
        fields,
        errors: {
          maxParticipants: 'Keine gültige Zahl',
        },
      })
    }

    const userId = await requireUserId(request)

    await createDate(fields, userId)
    return redirect('/')
  }

  return badRequest<CreateDateActionData>({ formError: 'Ungültige Methode' })
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined
}) => {
  const user = data?.user

  if (user) {
    return {
      title: `${user.name}${
        user.name.slice(-1) === 's' ? "'" : 's'
      } Diensttermine`,
    }
  }

  return {
    title: 'Dashboard',
  }
}

export default function Dashboard() {
  const data = useLoaderData() as LoaderData
  const user = data.user

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Welcome user={user} />
        <Dates dates={data.dates} />
        <div className="mt-4 text-center text-xs text-slate-500">
          v1.0 &middot; Danke für die Idee, Linda!
        </div>
      </Container>
    </div>
  )
}
