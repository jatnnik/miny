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
import { signIn } from '~/utils/db.server'
import { createUserSession, getUserSession } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return { title: 'Login' }
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
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="block rounded-lg bg-red-400 bg-opacity-20 p-2">
        <img
          src="https://emojicdn.elk.sh/🎒"
          className="h-8"
          height={32}
          width={32}
        />
      </div>
      <div className="mt-6 w-full max-w-md rounded-lg bg-white px-6 py-4 shadow-md">
        <Form method="post">
          {actionData?.error ? (
            <div className="mb-6 flex items-center rounded-lg bg-red-50 p-3 text-sm text-red-500">
              {actionData.error.code}
            </div>
          ) : null}

          <fieldset disabled={transition.state === 'submitting'}>
            <div>
              <label
                htmlFor="email"
                className="mb-0.5 block text-sm font-medium"
              >
                E-Mail
              </label>

              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
                required
                autoFocus
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="password"
                className="mb-0.5 block text-sm font-medium"
              >
                Passwort
              </label>

              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-400 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1">
                <Link
                  className="block text-sm text-slate-600 underline hover:text-slate-900"
                  to="/register"
                >
                  Registrieren
                </Link>

                {/* <Link
                  className='block underline text-sm text-slate-600 hover:text-slate-900'
                  to='/forgot-password'
                >
                  Passwort vergessen?
                </Link> */}
              </div>

              <button
                type="submit"
                className="ml-3 rounded-md border border-transparent bg-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white ring-slate-300 transition duration-150 ease-in-out hover:bg-slate-600 focus:border-slate-800 focus:outline-none focus:ring active:bg-slate-800 disabled:opacity-25"
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
