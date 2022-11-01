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

import tailwind from "./styles/tailwind-build.css"
import React from "react"

export const loader = ({ request }: LoaderArgs) => {
  return json({
    url: request.url,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    charset: "utf-8",
    viewport:
      "width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, user-scalable=no",
    title: "miny",
    description: "Ganz einfach Diensttermine ausmachen.",
    "og:title": "miny",
    "og:description": "Ganz einfach Diensttermine ausmachen.",
    "og:image": `https://dienst.vercel.app/og_image.png`,
    "og:url": data.url,
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
  return [
    { rel: "stylesheet", href: tailwind },
    { rel: "shortcut icon", href: "/favicon.ico" },
    {
      rel: "prefetch",
      as: "image",
      href: "/backpack.png",
    },
  ]
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-100 font-sans text-slate-700 antialiased">
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
          {caught.status} – {caught.data}
        </h1>
      </div>
    </Document>
  )
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
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
