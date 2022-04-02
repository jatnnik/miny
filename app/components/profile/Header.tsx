import { Link } from '@remix-run/react'

export default function Header() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center">
        <div className="block rounded-lg bg-red-400 bg-opacity-20 p-2">
          <img
            src="/backpack.png"
            className="h-5"
            alt="Rucksack Emoji"
            height={20}
            width={20}
          />
        </div>
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
