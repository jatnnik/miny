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
} from 'remix'
import React, { useState } from 'react'
import { commitSession, getUserSession } from '~/sessions.server'
import invariant from 'tiny-invariant'
import { Icon, LoadingSpinner } from '~/components/Icons'
import { renderLoginError } from '~/utils/errors'

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
  const [showPassword, setShowPassword] = useState(false)

  const handlePasswordToggle = (event: React.MouseEvent) => {
    event.preventDefault()
    setShowPassword(!showPassword)
  }

  return (
    <div className='max-w-lg mx-auto mt-2 p-6'>
      <Form
        method='post'
        className='p-8 mt-6 mb-0 space-y-4 rounded-md bg-white shadow-md border border-gray-100'
      >
        <p className='text-lg font-semibold mb-6'>Login</p>

        {actionData?.error ? (
          <div className='bg-red-50 text-red-500 p-3 rounded-lg text-sm flex items-center'>
            <Icon icon='warning' /> {renderLoginError(actionData.error.code as string)}
          </div>
        ) : null}

        <div>
          <label htmlFor='email' className='text-sm font-medium'>
            E-Mail
          </label>

          <div className='relative mt-1'>
            <input
              type='email'
              id='email'
              name='email'
              className='w-full p-4 pr-12 text-sm border-gray-200 rounded-md shadow-sm'
              placeholder='E-Mail Adresse'
              required
            />

            <span className='absolute inset-y-0 inline-flex items-center right-4'>
              <Icon icon='at' />
            </span>
          </div>
        </div>

        <div>
          <label htmlFor='password' className='text-sm font-medium'>
            Passwort
          </label>

          <div className='relative mt-1'>
            <input
              type={showPassword ? 'text' : 'password'}
              id='password'
              name='password'
              className='w-full p-4 pr-12 text-sm border-gray-200 rounded-md shadow-sm'
              placeholder='Passwort'
              required
            />

            <button
              className='absolute inset-y-0 inline-flex items-center right-4'
              onClick={handlePasswordToggle}
            >
              {showPassword ? <Icon icon='eyeOff' /> : <Icon icon='eye' />}
            </button>
          </div>
        </div>

        <button
          type='submit'
          disabled={transition.state === 'submitting'}
          className='inline-flex justify-center w-full px-5 py-3 text-sm font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-400'
        >
          {transition.state === 'submitting' ? <LoadingSpinner /> : 'Anmelden'}
        </button>

        <p className='text-sm text-center text-gray-500'>
          Noch kein Konto?{' '}
          <Link to='/register' className='underline hover:text-gray-600'>
            Registrieren
          </Link>
          <br />
          <Link to='/forgot' className='underline hover:text-gray-600'>
            Passwort vergessen?
          </Link>
        </p>
      </Form>

      <img
        src='/images/login-illustration.svg'
        alt='Zwei Personen unterhalten sich per Videochat'
        className='h-52 mx-auto mt-6'
        height={208}
      />
    </div>
  )
}
