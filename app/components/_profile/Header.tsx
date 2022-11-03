import { Link } from "@remix-run/react"

export default function Header() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <Link
          className="ml-2 flex items-center gap-2 text-sm font-medium"
          to="/"
        >
          <img src="/backpack.png" className="w-6" alt="" />
          miny
        </Link>
      </div>
      <Link
        to="/register"
        className="text-sm text-amber-800 underline underline-offset-1 hover:text-amber-700"
      >
        Jetzt anmelden
      </Link>
    </div>
  )
}
