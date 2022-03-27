import {
  type LoaderFunction,
  useLoaderData,
  json,
  redirect,
  Form,
  type ActionFunction,
  type MetaFunction,
} from 'remix'
import { signOut, getUserSession } from '~/utils/session.server'
import invariant from 'tiny-invariant'
import Avatar from 'boring-avatars'

import Container from '~/components/Container'
import Card from '~/components/Card'

import { getDisplayName } from '~/utils/db.server'
import { useGreeting } from '~/hooks'

type HeaderProps = {
  username: string
}

type User = {
  email?: string
  username: string
}

export const meta: MetaFunction = () => {
  return {
    title: 'Dashboard – miny',
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  // Redirect to login if user is not authenticated
  const sessionUser = await getUserSession(request)

  if (!sessionUser) {
    return redirect('/login')
  }

  // Get username
  const username = await getDisplayName(sessionUser.uid)
  invariant(username, 'user has no username')

  // Create the user object
  const user: User = {
    email: sessionUser.email,
    username,
  }

  return json({ user })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const method = formData.get('method')?.toString()

  if (method === 'signout') {
    return signOut(request)
  }
}

const Header = ({ username }: HeaderProps) => (
  <div className="mb-8 flex items-center justify-between">
    <div className="flex items-center">
      <Avatar
        size={32}
        name={username}
        variant="beam"
        colors={['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#405059']}
      />
      <span className="ml-2.5 block text-sm font-medium">{username}</span>
    </div>
    <Form method="post">
      <input type="hidden" name="method" value="signout" />
      <button
        type="submit"
        className="text-xs text-red-600 underline underline-offset-1 hover:text-red-500"
      >
        Abmelden
      </button>
    </Form>
  </div>
)

export default function Dashboard() {
  const data = useLoaderData()
  const user: User = data.user

  const greeting = useGreeting()

  return (
    <div className="py-10">
      <Container>
        <Header username={user.username} />
        <Card>
          <div className="flex items-center">
            <h1 className="mr-2 font-serif text-2xl font-black text-slate-700">
              {greeting} {user.username}
            </h1>
            <img
              src="https://emojicdn.elk.sh/👋"
              alt="Winkende Hand Emoji"
              className="wave h-7"
              height="28"
            />
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
