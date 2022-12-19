import { Link, Outlet } from "@remix-run/react"

import Container from "~/components/shared/Container"
import Footer from "~/components/shared/Footer"
import Menu from "~/components/shared/Menu"
import { useOptionalUser } from "~/utils"

export default function AppRoute() {
  const user = useOptionalUser()

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
        {user ? (
          <Menu />
        ) : (
          <Link
            to="join"
            className="rounded-md bg-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-opacity-75"
          >
            Registrieren
          </Link>
        )}
      </div>
      <div className="h-6"></div>
      <Outlet />
      <div className="h-6"></div>
      <Footer />
      <div className="h-6"></div>
    </Container>
  )
}
