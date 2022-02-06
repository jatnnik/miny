import { type LoaderFunction, useLoaderData, json, redirect } from 'remix'
import { auth } from '~/utils/firebase'
import { commitSession, getUserSession } from '~/sessions.server'

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request)

  if (!session.has('access_token')) {
    return redirect('/login')
  }

  const data = { user: auth.currentUser, error: session.get('error') }
  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

export default function Dashboard() {
  const data = useLoaderData()
  const greeting = data?.user?.email ? data.user.email : 'friend'

  return (
    <div>
      <h1>Congrats, {greeting}! You made it to the dashboard!</h1>

      <h2>Your data</h2>
      <pre>{JSON.stringify(data.user, null, 2)}</pre>
    </div>
  )
}
