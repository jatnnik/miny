import {
  type LoaderFunction,
  useLoaderData,
  json,
  Form,
  type MetaFunction,
  Link,
} from 'remix'

import { requireUser } from '~/session.server'
import type { User } from '~/models/user.server'

import Container from '~/components/Container'
import Card from '~/components/Card'

type LoaderData = { user: User }

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  return json({ user })
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

type HeaderProps = {
  username: string
}

const Header = ({ username }: HeaderProps) => (
  <div className="mb-8 flex items-center justify-between">
    <div className="flex items-center">
      <div className="block rounded-lg bg-red-400 bg-opacity-20 p-2">
        <img
          src="https://emojicdn.elk.sh/🎒"
          className="h-5"
          height={20}
          width={20}
        />
      </div>
      <Link className="ml-2 block text-sm font-medium" to="/">
        {username}
        {username.slice(-1) === 's' ? "'" : 's'} Diensttermine
      </Link>
    </div>
    <Form action="/logout" method="post">
      <button
        type="submit"
        className="text-xs text-red-700 underline underline-offset-1 hover:text-red-600"
      >
        Abmelden
      </button>
    </Form>
  </div>
)

function useGreeting() {
  const currentHour = new Date().getHours()
  let greeting = 'Hey'

  if (currentHour < 11 && currentHour > 4) {
    greeting = 'Guten Morgen'
  } else if (currentHour > 18) {
    greeting = 'Guten Abend'
  }

  return greeting
}

export default function Dashboard() {
  const data = useLoaderData()
  const user: User = data.user

  const greeting = useGreeting()

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Card>
          <div className="flex items-center">
            <h1 className="mr-2 font-serif text-2xl font-black text-slate-700">
              {greeting} {user.name}!
            </h1>
          </div>
          <p className="mt-4">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas
            dolores id quo illum facere vel quia culpa? Atque necessitatibus
            similique nemo voluptatibus iusto, assumenda, minus, nisi ullam iste
            impedit voluptates?
          </p>
        </Card>
      </Container>
    </div>
  )
}
