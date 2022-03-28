import {
  type LoaderFunction,
  useLoaderData,
  json,
  type MetaFunction,
} from 'remix'

import { requireUser } from '~/session.server'
import type { User } from '~/models/user.server'

import Container from '~/components/Container'
import Header from '~/components/dashboard/Header'
import Welcome from '~/components/dashboard/Welcome'

type LoaderData = { user: User; host: string }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  const host = request.headers.get('host')
  return json({ user, host })
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
  const data = useLoaderData()
  const user: User = data.user
  const sharingLink = `https://${data.host}/u/${user.slug}`

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Welcome user={user} link={sharingLink} />
      </Container>
    </div>
  )
}
