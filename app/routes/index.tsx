import {
  type LoaderFunction,
  useLoaderData,
  json,
  type MetaFunction,
} from 'remix'

import { requireUser } from '~/session.server'
import { getDatesByUserId, type Date } from '~/models/date.server'
import type { User } from '~/models/user.server'

import Container from '~/components/Container'
import Header from '~/components/dashboard/Header'
import Welcome from '~/components/dashboard/Welcome'
import Dates from '~/components/dashboard/Dates'

type LoaderData = { user: User; host: string; dates: Date[] }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  const dates = await getDatesByUserId(user.id)
  const host = request.headers.get('host')
  return json({ user, host, dates })
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
  const sharingLink = `https://${data.host}/u/${user.slug}`

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Welcome user={user} link={sharingLink} />
        <Dates dates={data.dates} />
        <div className="mt-4 text-center text-xs text-slate-500">
          v1.0 &middot; Danke für die Idee, Linda!
        </div>
      </Container>
    </div>
  )
}
