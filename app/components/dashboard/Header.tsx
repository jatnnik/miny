import { Link, Form } from "@remix-run/react"

export default function Header({ username }: { username: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Link
          className="ml-2 flex items-center gap-2 text-sm font-semibold"
          to="/"
        >
          <img src="/backpack.png" className="w-6" alt="" />
          {username}
        </Link>
      </div>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="text-xs font-normal text-rose-700 underline underline-offset-1 hover:text-red-600"
        >
          Abmelden
        </button>
      </Form>
    </div>
  )
}
