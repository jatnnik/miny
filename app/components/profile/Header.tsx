import { Link } from "@remix-run/react"
import Backpack from "../Backpack"

export default function Header() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center">
        <Backpack size={20} />
        <Link className="ml-2 block text-sm font-medium" to="/">
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
