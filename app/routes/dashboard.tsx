import { type LoaderFunction, useLoaderData, json, redirect, Form, ActionFunction } from 'remix'
import { auth } from '~/utils/firebase'
import { commitSession, getUserSession } from '~/sessions.server'

import Container from '../components/Container'
import Card from '~/components/Card'

interface NotVerifiedProps {
  email: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request)

  if (!session.has('access_token') || !auth.currentUser) {
    return redirect('/')
  }

  const data = { user: auth.currentUser, error: session.get('error') }
  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request)

  // Refresh the current user to re-check if the email is verified
  await auth.currentUser?.reload()

  const data = { user: auth.currentUser, error: session.get('error') }
  if (session.has('access_token')) {
    return json(data, {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  }
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
    <div className='py-10'>
      <Container>
        <Card>
          <div className='flex items-center'>
            <h1 className='mr-2 font-bold text-xl'>Hey {user.displayName}</h1>
            <img
              src='/images/waving-hand.png'
              alt='Winkende Hand Emoji'
              className='wave h-7'
              height='28'
            />
          </div>
          <p className='pt-2 text-slate-600'>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas dolores id quo illum
            facere vel quia culpa? Atque necessitatibus similique nemo voluptatibus iusto,
            assumenda, minus, nisi ullam iste impedit voluptates?
          </p>
        </Card>
      </Container>
    </div>
  )
}

const NotVerified = ({ email }: NotVerifiedProps) => {
  return (
    <div className='mt-10 text-slate-800'>
      <Container>
        <Card>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-indigo-700'
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
            <h3 className='font-medium text-indigo-700'>E-Mail Adresse bestätigen.</h3>

            <p className='mt-4 text-sm opacity-90'>
              Du müsstest eine Bestätigungsmail an <span className='font-semibold'>{email}</span>{' '}
              bekommen haben. Bitte folge den Anweisungen darin, um deine E-Mail Adresse zu
              bestätigen.
            </p>

            <button className='px-4 py-2 mt-6 font-semibold text-xs leading-6 shadow rounded-md text-white bg-indigo-500 transition-colors ease-in-out duration-150 hover:bg-indigo-400'>
              Bestätigunsmail erneut senden
            </button>

            <Form method='post' className='inline'>
              <button
                type='submit'
                className='ml-2 px-4 py-2 mt-6 font-semibold text-xs leading-6 shadow rounded-md text-white bg-emerald-500 transition-colors ease-in-out duration-150 hover:bg-emerald-400'
              >
                Ich habe meine E-Mail bestätigt
              </button>
            </Form>
          </div>
        </Card>
      </Container>
    </div>
  )
}
