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
import { getSession, commitSession, getUserSession } from '~/sessions.server'
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
    <div>
      <h1>Login</h1>
      <Form method='post'>
        <p>
          <label htmlFor='email'>E-Mail</label>
          <input type='email' name='email' placeholder='deine@mail.de' required />
        </p>
        <p>
          <label htmlFor='password'>Passwort</label>
          <input type='password' name='password' required />
        </p>

        <button type='submit'>Login</button>
      </Form>

      <div>
        <Link to='/register'>Registrieren</Link>
        <Link to='/forgot'>Passwort vergessen?</Link>
      </div>

      {actionData?.error ? (
        <div className='bg-red-50 text-red-500 p-2'>Error: {actionData.error.code}</div>
      ) : null}
    </div>
  )
}
