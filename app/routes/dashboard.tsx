import { type LoaderFunction, useLoaderData, json, redirect } from 'remix'
import { auth } from '~/utils/firebase'
import { commitSession, getUserSession } from '~/sessions.server'

interface NotVerifiedProps {
  email: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request)

  if (!session.has('access_token') || !auth.currentUser) {
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
  const user = {
    isVerified: data.user.emailVerified,
    email: data.user.email,
    displayName: data.user.providerData[0].displayName,
  }

  console.log(user)

  if (!user.isVerified) {
    return <NotVerified email={user.email} />
  }

  return (
    <div>
      <h1>Hey!</h1>
    </div>
  )
}

const NotVerified = ({ email }: NotVerifiedProps) => {
  return (
    <div className='max-w-md mx-auto mt-8 p-6 text-indigo-700 rounded-lg bg-indigo-50' role='alert'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-6 w-6'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
        />
      </svg>

      <div className='max-w-prose mt-4'>
        <h3 className='font-medium'>
          Bevor du miny nutzen kannst, musst du noch deine E-Mail Adresse bestätigen.
        </h3>

        <p className='mt-4 text-sm opacity-90'>
          Klicke auf den Button um eine Bestätigungsmail an{' '}
          <span className='font-semibold'>{email}</span> zu verschicken. Bitte folge den Anweisungen
          darin, um deine E-Mail Adresse zu bestätigen.
        </p>
      </div>
    </div>
  )
}
