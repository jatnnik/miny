import {
  type LoaderFunction,
  json,
  type MetaFunction,
  type ActionFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUser, requireUserId } from '~/session.server'
import {
  deleteDate,
  getDatesByUserId,
  type DateWithParticipants,
} from '~/models/date.server'
import type { PublicUser } from '~/models/user.server'
import { utcToZonedTime } from 'date-fns-tz'

import Container from '~/components/Container'
import Header from '~/components/dashboard/Header'
import Welcome from '~/components/dashboard/Welcome'
import Dates from '~/components/dashboard/Dates'
import { badRequest } from '~/utils'

type LoaderData = {
  user: PublicUser
  dates: DateWithParticipants[]
  greeting: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  const dates = await getDatesByUserId(user.id)
  let greeting = 'Hey'

  const currentHour = utcToZonedTime(new Date(), 'Europe/Berlin').getHours()
  if (currentHour < 11 && currentHour > 4) {
    greeting = 'Guten Morgen'
  } else if (currentHour > 18) {
    greeting = 'Guten Abend'
  }

  return json<LoaderData>(
    { user, dates, greeting },
    {
      headers: {
        'Cache-Control': 's-maxage=10',
      },
    }
  )
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

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  const user = data.user

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
  const { user, dates, greeting } = useLoaderData() as LoaderData

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Welcome user={user} greeting={greeting} />
        <Dates dates={dates} />
        <div className="mt-4 text-center text-xs text-slate-500">
          <span className="block">
            v1.0 &middot; Danke für die Idee, Linda!
          </span>
          <a
            href="https://github.com/wh1zk1d/miny/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noreferrer"
            title="Changelog"
            className="underline underline-offset-1"
          >
            Changelog
          </a>
        </div>
      </Container>
    </div>
  )
}
