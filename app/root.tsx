import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react'
import {
  type MetaFunction,
  type ErrorBoundaryComponent,
  type LoaderFunction,
  json,
} from '@remix-run/node'

import tailwind from './styles/tailwind-build.css'

type LoaderData = {
  url: string
  host: string
}
export const loader: LoaderFunction = ({ request }) => {
  return json<LoaderData>({
    url: request.url,
    host: request.headers.get('host') ?? 'https://miny.vercel.app',
  })
}

export const meta: MetaFunction = ({ data }: { data: LoaderData }) => {
  return {
    charset: 'utf-8',
    viewport: 'width=device-width,initial-scale=1',
    title: 'miny',
    description: 'Ganz einfach Diensttermine ausmachen.',
    'og:title': 'miny',
    'og:description': 'Ganz einfach Diensttermine ausmachen.',
    'og:image': `${data.host}/og_image.png`,
    'og:url': data.url,
    'og:type': 'website',
    'theme-color': '#1e293b',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'miny',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    robots: 'noindex',
  }
}

export const links = () => {
  return [
    { rel: 'stylesheet', href: tailwind },
    { rel: 'shortcut icon', href: '/favicon.ico' },
  ]
}

export default function App() {
  return (
    <html lang="de" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full min-h-screen bg-slate-50 font-sans text-slate-600 antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error)

  return (
    <html>
      <head>
        <title>Error!</title>
        <Meta />
        <Links />
      </head>
      <body className="p-4">
        <h1>Oh no! Ein Fehler ist aufgetreten.</h1>
        <pre className="mt-3 inline-block bg-gray-200">
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
      <body className="p-4">
        <h1>Whoopsie! Da ging leider was schief...</h1>
        <pre className="mt-3 inline-block bg-gray-200">
          {caught.status} {caught.statusText}
        </pre>
        <Scripts />
      </body>
    </html>
  )
}
