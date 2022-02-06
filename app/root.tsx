import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  json,
  Form,
  redirect,
} from 'remix'
import type { MetaFunction, ErrorBoundaryComponent, LoaderFunction, ActionFunction } from 'remix'
import { destroySession, commitSession, getUserSession } from './sessions.server'
import { auth } from './utils/firebase'
import type { FC } from 'react'

import styles from './styles/app.css'

export const meta: MetaFunction = () => {
  return { title: 'miny', description: 'Ganz einfach Dienst-Termine vereinbaren.' }
}

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request)

  if (session.has('access_token')) {
    const data = { user: auth.currentUser, error: session.get('error') }
    return json(data, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    })
  } else {
    return null
  }
}

// Sign out action
export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request)

  if (session.has('access_token')) {
    return redirect('/', {
      headers: { 'Set-Cookie': await destroySession(session) },
    })
  }
  auth.signOut()
  return redirect('/')
}

export default function App() {
  const data = useLoaderData()
  const isLoggedIn = data?.user

  return (
    <Layout>
      <header className='sticky inset-x-0 top-0 z-50 bg-white border-b-2 border-gray-100'>
        <div className='max-w-screen-xl px-4 mx-auto h-16 flex justify-between items-center'>
          <nav role='navigation' className='flex items-center space-x-4'>
            <Link to='/'>
              <img src='/images/miny.svg' alt='miny Logo' className='h-5' />
            </Link>
            {isLoggedIn && (
              <>
                <span className='block w-px h-6 bg-gray-100'></span>
                <Link
                  className='text-xs font-medium hover:opacity-75 flex items-center'
                  to='/dashboard'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1 sm:h-3 sm:w-3'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                  <span className='sr-only sm:not-sr-only'>Termine</span>
                </Link>
                <span className='block w-px h-6 bg-gray-100'></span>
                <Link
                  className='flex items-center text-xs font-medium hover:opacity-75'
                  to='/settings'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1 sm:h-3 sm:w-3'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                  <span className='sr-only sm:not-sr-only'>Einstellungen</span>
                </Link>
              </>
            )}
          </nav>
          {isLoggedIn ? (
            <Form method='post'>
              <button
                type='submit'
                className='px-3 py-1.5 font-semibold text-xs leading-6 shadow rounded-md text-white bg-red-500 transition-colors ease-in-out duration-150 hover:bg-red-400'
              >
                Abmelden
              </button>
            </Form>
          ) : (
            <Link
              className='px-3 py-1.5 font-semibold text-xs leading-6 shadow rounded-md text-white bg-indigo-500 transition-colors ease-in-out duration-150 hover:bg-indigo-400'
              to='/login'
            >
              Anmelden
            </Link>
          )}
        </div>
      </header>
    </Layout>
  )
}

const Layout: FC = ({ children }) => (
  <html lang='de'>
    <head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <Meta />
      <Links />
    </head>
    <body className='antialiased'>
      {children}
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      {process.env.NODE_ENV === 'development' && <LiveReload />}
    </body>
  </html>
)

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)

  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Oh no! An error occured.</h1>
        <pre>
          {error.name}: {error.message}
        </pre>
        <Scripts />
      </body>
    </html>
  )
}
