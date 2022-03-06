import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from 'remix'
import type { MetaFunction, ErrorBoundaryComponent } from 'remix'
import type { FC } from 'react'

import tailwind from './styles/tailwind-build.css'

export const meta: MetaFunction = () => {
  return { title: 'miny', description: 'Ganz einfach Diensttermine vereinbaren.' }
}

export const links = () => {
  return [{ rel: 'stylesheet', href: tailwind }]
}

export default function App() {
  return <Layout />
}

const Layout: FC = ({ children }) => (
  <html lang='de'>
    <head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width,initial-scale=1' />
      <Meta />
      <Links />
    </head>
    <body className='antialiased font-sans bg-slate-100 text-slate-600 min-h-screen'>
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
        <title>Error!</title>
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
        <title>Whoopsie!</title>
        <Meta />
        <Links />
      </head>
      <body className='p-4'>
        <h1>Whoopsie! An error was thrown!</h1>
        <pre className='bg-gray-200 inline-block mt-3'>
          {caught.status} {caught.statusText}
        </pre>
        <Scripts />
      </body>
    </html>
  )
}
