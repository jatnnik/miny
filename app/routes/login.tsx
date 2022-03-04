import {
  redirect,
  Form,
  Link,
  useActionData,
  useTransition,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from 'remix'
import invariant from 'tiny-invariant'
import { renderLoginError } from '~/utils/errors'
import { signIn } from '~/utils/db.server'
import { createUserSession, getUserSession } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return { title: 'Login – miny' }
}

// Redirect to dashboard if the user already has a valid session
export const loader: LoaderFunction = async ({ request }) => {
  const sessionUser = await getUserSession(request)
  if (sessionUser) {
    return redirect('/')
  }

  return null
}

// Sign user in, create the session and redirect to dashboard
export const action: ActionFunction = async ({ request }) => {
  console.log(request.headers.get('Content-Type'))

  const formData = await request.formData()

  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()

  invariant(email, 'email is required')
  invariant(password, 'password is required')

  const { user } = await signIn(email, password)
  const token = await user.getIdToken()
  return createUserSession(token)
}

export default function Login() {
  const actionData = useActionData()
  const transition = useTransition()

  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      <div className='bg-red-400 bg-opacity-20 p-2 block rounded-lg'>
        <img src='https://emojicdn.elk.sh/🎒' className='h-8' height={32} width={32} />
      </div>
      <div className='w-full max-w-md mt-6 px-6 py-4 bg-white shadow-md rounded-lg'>
        <Form method='post'>
          {actionData?.error ? (
            <div className='bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm flex items-center'>
              {renderLoginError(actionData.error.code as string)}
            </div>
          ) : null}

          <fieldset disabled={transition.state === 'submitting'}>
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
                <Link
                  className='block underline text-sm text-slate-600 hover:text-slate-900'
                  to='/register'
                >
                  Noch nicht registriert?
                </Link>

                <Link
                  className='block underline text-sm text-slate-600 hover:text-slate-900'
                  to='/forgot-password'
                >
                  Passwort vergessen?
                </Link>
              </div>

              <button
                type='submit'
                className='px-4 py-2 bg-slate-700 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-slate-600 active:bg-slate-800 focus:outline-none focus:border-slate-800 focus:ring ring-slate-300 disabled:opacity-25 transition ease-in-out duration-150 ml-3'
              >
                {transition.state === 'submitting' ? 'Lade...' : 'Anmelden'}
              </button>
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  )
}
