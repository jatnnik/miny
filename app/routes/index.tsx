import {
  type LoaderFunction,
  useLoaderData,
  json,
  type MetaFunction,
  type ActionFunction,
} from 'remix'

import { requireUser, requireUserId } from '~/session.server'
import {
  deleteDate,
  getDatesByUserId,
  type DateWithParticipants,
} from '~/models/date.server'
import type { User } from '~/models/user.server'

import Container from '~/components/Container'
import Header from '~/components/dashboard/Header'
import Welcome from '~/components/dashboard/Welcome'
import Dates from '~/components/dashboard/Dates'
import { badRequest } from '~/utils'

type LoaderData = { user: User; dates: DateWithParticipants[] }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  const dates = await getDatesByUserId(user.id)
  return json({ user, dates })
}

interface ActionData {
  formError?: string
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const method = formData.get('_method')
  const dateId = formData.get('id')

  if (
    typeof method !== 'string' ||
    typeof dateId !== 'string' ||
    method !== 'delete'
  ) {
    throw badRequest<ActionData>({ formError: 'Ungültige Anfrage' })
  }

  const userId = await requireUserId(request)

  await deleteDate(Number(dateId), Number(userId))
  return null
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
  const { user, dates } = useLoaderData() as LoaderData

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Welcome user={user} />
        <Dates dates={dates} />
        <div className="mt-4 text-center text-xs text-slate-500">
          v1.0 &middot; Danke für die Idee, Linda!
        </div>
      </Container>
    </div>
  )
}
