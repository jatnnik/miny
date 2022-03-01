import { auth } from '~/utils/firebase'
import { signInWithEmailAndPassword } from '@firebase/auth'
import {
  redirect,
  Form,
  Link,
  json,
  useActionData,
  useTransition,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from 'remix'
import { commitSession, getUserSession } from '~/sessions.server'
import invariant from 'tiny-invariant'
import { Icon, LoadingSpinner } from '~/components/Icons'
import { renderLoginError } from '~/utils/errors'

export const meta: MetaFunction = () => {
  return { title: 'Login – miny', description: 'Ganz einfach Diensttermine vereinbaren.' }
}

// Check for an existing session
// If found, send the user to the dashboard
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request)

  if (session.has('access_token') && auth.currentUser) {
    return redirect('/dashboard')
  }

  const data = { error: session.get('error') }

  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

// Sign user in, create the session and redirect to dashboard
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  invariant(email, 'Email is required')
  invariant(password, 'Password is required')

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    if (user) {
      const session = await getUserSession(request)
      session.set('access_token', await user.getIdToken())
      return redirect('/dashboard', {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      })
    }
  } catch (error) {
    return { error }
  }
}

export default function Login() {
  const actionData = useActionData()
  const transition = useTransition()

  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      <div>
        <Link to='/' className='bg-red-400 bg-opacity-20 p-2 block rounded-lg'>
          <img src='https://emojicdn.elk.sh/🎒' className='h-8' />
        </Link>
      </div>
      <div className='w-full max-w-md mt-6 px-6 py-4 bg-white shadow-md rounded-lg'>
        <Form method='post'>
          {actionData?.error ? (
            <div className='bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center'>
              <Icon icon='warning' spaceRight /> {renderLoginError(actionData.error.code as string)}
            </div>
          ) : null}

          <div>
            <label htmlFor='email' className='text-sm font-medium block mb-0.5'>
              E-Mail
            </label>

            <input
              type='email'
              id='email'
              name='email'
              className='rounded-lg shadow-sm border-slate-300 focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50 block mt-1 w-full'
              required
              autoFocus
            />
          </div>

          <div className='mt-4'>
            <label htmlFor='password' className='text-sm font-medium block mb-0.5'>
              Passwort
            </label>

            <input
              type='password'
              id='password'
              name='password'
              className='rounded-lg shadow-sm border-slate-300 focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50 block mt-1 w-full'
              required
              autoComplete='current-password'
            />
          </div>

          <div className='flex items-center justify-between mt-4'>
            <div className='space-y-1'>
              <a
                className='block underline text-sm text-slate-600 hover:text-slate-900'
                href='/register'
              >
                Noch nicht registriert?
              </a>

              <a
                className='block underline text-sm text-slate-600 hover:text-slate-900'
                href='/forgot-password'
              >
                Passwort vergessen?
              </a>
            </div>

            <button
              type='submit'
              disabled={transition.state === 'submitting'}
              className='inline-flex items-center text-center px-4 py-2 bg-slate-700 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-slate-600 active:bg-slate-800 focus:outline-none focus:border-slate-800 focus:ring ring-slate-300 disabled:opacity-25 transition ease-in-out duration-150 ml-3'
            >
              Anmelden
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}
