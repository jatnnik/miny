import { auth } from '~/utils/firebase'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from '@firebase/auth'
import { redirect, Form, Link, useActionData, type ActionFunction } from 'remix'
import { commitSession, getUserSession } from '~/sessions.server'
import invariant from 'tiny-invariant'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const displayName = formData.get('firstName')?.toString()

  invariant(email, 'Email is required')
  invariant(password, 'Password is required')
  invariant(displayName, 'Name is required')

  // Perform a sign out to clear any active sessions
  await auth.signOut()

  try {
    await createUserWithEmailAndPassword(auth, email, password)
    const session = await getUserSession(request)

    // Send a verification email if the registration was successful and update the display name
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser)
      await updateProfile(auth.currentUser, { displayName })
    }

    session.set('access_token', auth.currentUser?.getIdToken())
    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  } catch (error) {
    return { error }
  }
}

export default function Register() {
  const actionData = useActionData()

  return (
    <div>
      <h1>Registrieren</h1>
      <Form method='post'>
        <p>
          <label htmlFor='firstName'>Vorname</label>
          <input type='text' name='firstName' placeholder='Dein Vorname' required />
        </p>
        <p>
          <label htmlFor='email'>E-Mail</label>
          <input type='email' name='email' placeholder='E-Mail Adresse' required />
        </p>
        <p>
          <label htmlFor='password'>Passwort</label>
          <input type='password' name='password' required />
        </p>

        <button type='submit'>Registrieren</button>
      </Form>

      <div>
        Bereits registriert? <Link to='/login'>Login</Link>
      </div>

      {actionData?.error ? (
        <div className='bg-red-50 text-red-500 p-2'>Error: {actionData.error.code}</div>
      ) : null}
    </div>
  )
}
