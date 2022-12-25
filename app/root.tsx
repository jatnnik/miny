import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "@remix-run/react"
import { json } from "@remix-run/node"
import React from "react"

import { getUserId, logout } from "./utils/session.server"
import { getSafeUserById } from "./models/user.server"

import tailwindStylesheetUrl from "./styles/tailwind-build.css"

export const meta: MetaFunction = () => {
  return {
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
    title: "miny",
    description: "Ganz einfach Diensttermine ausmachen.",
    "og:title": "miny",
    "og:description": "Ganz einfach Diensttermine ausmachen.",
    "og:image": `https://miny-og.vercel.app/api/og`,
    "og:type": "website",
    "theme-color": "#1e293b",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "miny",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    robots: "noindex",
  }
}

export const links = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }]
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  let user: Awaited<ReturnType<typeof getSafeUserById>> | null = null

  if (userId) {
    user = await getSafeUserById(Number(userId))
    if (!user) {
      throw logout(request)
    }
  }

  return json({ user })
}

function Document({ children }: React.PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-slate-100 font-sans text-slate-700 antialiased">
        {children}
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </Document>
  )
}

export const CatchBoundary = () => {
  const caught = useCatch()

  return (
    <Document>
      <div className="p-4">
        <h1 className="font-medium">
          Error {caught.status}: {caught.data ? caught.data : caught.statusText}
        </h1>
      </div>
    </Document>
  )
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  console.error(error)

  return (
    <Document>
      <div className="p-4">
        <h1 className="font-bold text-red-700">App Error</h1>
        <pre>{error.message}</pre>
        <p className="mt-4 mb-2 font-bold">Stacktrace:</p>
        <pre>{error.stack}</pre>
      </div>
      <Scripts />
    </Document>
  )
}
