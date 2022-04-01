import {
  type LoaderFunction,
  useCatch,
  json,
  useLoaderData,
  type MetaFunction,
} from 'remix'
import { getUserBySlug } from '~/models/user.server'
import invariant from 'tiny-invariant'
import { type DateWithParticipants, getFreeDates } from '~/models/date.server'

import Container from '~/components/Container'
import Card from '~/components/Card'
import Header from '~/components/profile/Header'
import { headingStyles } from '~/components/Heading'
import DateSlot from '~/components/profile/Date'

type LoaderData = {
  user: {
    id: number
    name: string
    email: string
    slug: string | null
  }
  dates: DateWithParticipants[]
}

export const loader: LoaderFunction = async ({ params }) => {
  const username = params.user
  invariant(username, 'Invalid user slug')

  const user = await getUserBySlug(username)
  if (!user) {
    throw json('Not found', 404)
  }

  const dates = await getFreeDates(user.id)

  return json<LoaderData>({ user, dates })
}

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  const { user } = data as LoaderData

  return {
    title: `${user.name}${
      user.name.slice(-1) === 's' ? "'" : 's'
    } Diensttermine`,
  }
}

export default function UserPage() {
  const { user, dates } = useLoaderData<LoaderData>()

  return (
    <div className="py-10">
      <Container>
        <Header />
        <Card withMarginTop>
          <h1 className={headingStyles}>
            {user.name} möchte einen Diensttermin mit dir ausmachen
          </h1>
          {dates.length > 0 ? (
            <>
              <p className="mt-4">
                Tippe einfach auf einen Termin, um dich einzutragen. {user.name}{' '}
                bekommt dann automatisch eine Nachricht.
              </p>
              <h2 className="mt-6 font-serif text-xl font-black text-slate-700">
                Termine
              </h2>
              <div className="flex flex-col space-y-4 divide-y divide-dashed">
                {dates.map(date => (
                  <DateSlot date={date} key={date.id} />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 italic">
              Aktuell sind keine Termine eingetragen.
            </p>
          )}
        </Card>
      </Container>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return (
    <div className="py-10">
      <Container>
        <Header />
        <Card withMarginTop>
          {caught.status === 404
            ? 'Hm, diesen Benutzer konnten wir leider nicht finden.'
            : `Ein Fehler ist aufgetreten (${caught.status})`}
        </Card>
      </Container>
    </div>
  )
}
