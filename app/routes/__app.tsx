import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, useLoaderData } from "@remix-run/react"

import Container from "~/components/shared/Container"
import Footer from "~/components/shared/Footer"
import Menu from "~/components/shared/Menu"
import { getUser } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request)
  return json({ isLoggedIn: !!user })
}

function LoginButton() {
  return (
    <Link
      to="login"
      className="rounded-md bg-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-opacity-75"
    >
      Anmelden
    </Link>
  )
}

export default function AppRoute() {
  const { isLoggedIn } = useLoaderData<typeof loader>()

  return (
    <Container>
      <div className="h-6 sm:h-8"></div>
      <div className="flex items-center justify-between">
        <div>
          <Link
            className="flex items-center gap-2 text-sm font-semibold"
            to="/"
          >
            <img src="/backpack.png" className="w-6" alt="" />
            <h1>miny</h1>
          </Link>
        </div>
        {isLoggedIn ? <Menu /> : <LoginButton />}
      </div>
      <div className="h-6"></div>
      <Outlet />
      <div className="h-6"></div>
      <Footer />
      <div className="h-6"></div>
    </Container>
  )
}
