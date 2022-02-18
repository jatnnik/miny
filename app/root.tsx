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
  useCatch,
} from 'remix'
import type { MetaFunction, ErrorBoundaryComponent, LoaderFunction, ActionFunction } from 'remix'
import { destroySession, commitSession, getUserSession } from './sessions.server'
import { auth } from './utils/firebase'
import type { FC } from 'react'
import { Icon } from './components/Icons'

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
      <header className='sticky inset-x-0 top-0 z-50 bg-white border-b-2 border-slate-200'>
        <div className='max-w-screen-lg px-6 mx-auto h-16 flex justify-between items-center'>
          <nav role='navigation' className='flex items-center space-x-4'>
            <Link to='/'>
              <img src='/images/miny.svg' alt='miny Logo' className='h-5' />
            </Link>
            {isLoggedIn && (
              <>
                <span className='block w-px h-6 bg-gray-200'></span>
                <Link
                  className='text-xs font-medium hover:opacity-75 flex items-center'
                  to='/dashboard'
                >
                  <Icon icon='calendar' spaceRight />
                  <span className='sr-only sm:not-sr-only'>Termine</span>
                </Link>
                <span className='block w-px h-6 bg-gray-200'></span>
                <Link
                  className='flex items-center text-xs font-medium hover:opacity-75'
                  to='/settings'
                >
                  <Icon icon='settings' spaceRight />
                  <span className='sr-only sm:not-sr-only'>Einstellungen</span>
                </Link>
              </>
            )}
          </nav>
          {isLoggedIn && (
            <Form method='post'>
              <button
                type='submit'
                className='flex items-center text-xs font-medium hover:opacity-75'
              >
                <Icon icon='logout' spaceRight />
                <span className='sr-only sm:not-sr-only'>Abmelden</span>
              </button>
            </Form>
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
    <body className='antialiased bg-slate-50'>
      {children}
      <Outlet />
      <Footer />
      <ScrollRestoration />
      <Scripts />
      {process.env.NODE_ENV === 'development' && <LiveReload />}
    </body>
  </html>
)

const Footer = () => (
  <p className='text-xs text-slate-500 text-center py-6'>
    &copy;{new Date().getFullYear()} &middot;{' '}
    <a href='https://github.com/wh1zk1d' target='_blank' rel='noopener noreferrer'>
      wh1zk1d
    </a>{' '}
    &middot; Danke für die Idee Linda.
  </p>
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
      <body className='p-4'>
        <h1>Oh no! An error occured.</h1>
        <pre className='bg-gray-200 inline-block mt-3'>
          {error.name}: {error.message}
        </pre>
        <Scripts />
      </body>
    </html>
  )
}

export const CatchBoundary = () => {
  const caught = useCatch()

  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body className='p-4'>
        <h1>Oops! An error was thrown!</h1>
        <pre className='bg-gray-200 inline-block mt-3'>
          {caught.status} {caught.statusText}
        </pre>
        <Scripts />
      </body>
    </html>
  )
}
