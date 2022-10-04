import { Link, Outlet } from "@remix-run/react"

import Container from "~/components/shared/Container"
import Footer from "~/components/shared/Footer"
import Menu from "~/components/shared/Menu"

export default function AppRoute() {
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
        <Menu />
      </div>
      <div className="h-6"></div>
      <Outlet />
      <div className="h-6"></div>
      <Footer />
    </Container>
  )
}
