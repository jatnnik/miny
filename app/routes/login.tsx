import { auth } from '~/utils/firebase'
import { signInWithEmailAndPassword } from '@firebase/auth'
import {
  redirect,
  Form,
  Link,
  json,
  useActionData,
  type LoaderFunction,
  type ActionFunction,
} from 'remix'
import { commitSession, getUserSession } from '~/sessions.server'
import invariant from 'tiny-invariant'

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

  return (
    <div className='max-w-lg mx-auto mt-12 p-6'>
      <Form
        method='post'
        className='p-8 mt-6 mb-0 space-y-4 rounded-lg bg-white shadow-lg border border-gray-100'
      >
        <p className='text-lg font-semibold mb-6'>Login</p>

        <div>
          <label htmlFor='email' className='text-sm font-medium'>
            E-Mail
          </label>

          <div className='relative mt-1'>
            <input
              type='email'
              id='email'
              name='email'
              className='w-full p-4 pr-12 text-sm border-gray-200 rounded-lg shadow-sm'
              placeholder='E-Mail Adresse'
              required
            />

            <span className='absolute inset-y-0 inline-flex items-center right-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-5 h-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label htmlFor='password' className='text-sm font-medium'>
            Passwort
          </label>

          <div className='relative mt-1'>
            <input
              type='password'
              id='password'
              name='password'
              className='w-full p-4 pr-12 text-sm border-gray-200 rounded-lg shadow-sm'
              placeholder='Passwort'
              required
            />

            <span className='absolute inset-y-0 inline-flex items-center right-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='w-5 h-5 text-gray-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                />
                <path
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                />
              </svg>
            </span>
          </div>
        </div>

        <button
          type='submit'
          className='block w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500'
        >
          Anmelden
        </button>

        <p className='text-sm text-center text-gray-500'>
          Noch kein Konto?{' '}
          <Link to='/register' className='underline'>
            Registrieren
          </Link>
          <br />
          <Link to='/forgot' className='underline'>
            Passwort vergessen?
          </Link>
        </p>

        {actionData?.error ? (
          <div className='bg-red-50 text-red-500 p-2'>Error: {actionData.error.code}</div>
        ) : null}
      </Form>
    </div>
  )
}
