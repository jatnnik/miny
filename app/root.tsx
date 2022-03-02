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

import tailwind from './styles/tailwind-build.css'

export const meta: MetaFunction = () => {
  return { title: 'miny', description: 'Ganz einfach Diensttermine vereinbaren.' }
}

export const links = () => {
  return [{ rel: 'stylesheet', href: tailwind }]
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
    return redirect('/login', {
      headers: { 'Set-Cookie': await destroySession(session) },
    })
  }
  auth.signOut()
  return redirect('/login')
}

export default function App() {
  const data = useLoaderData()
  const isLoggedIn = data?.user

  return (
    <Layout>
      {isLoggedIn && (
        <Form method='post'>
          <button
            type='submit'
            className='flex items-center text-xs font-medium hover:opacity-75 absolute right-5 top-5 text-rose-600'
          >
            <Icon icon='logout' spaceRight />
            <span className='sr-only sm:not-sr-only'>Abmelden</span>
          </button>
        </Form>
      )}
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
    <body className='antialiased font-sans bg-slate-100 text-slate-700'>
      {children}
      <Outlet />
      {/* <Footer /> */}
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
