import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { requireUser } from "~/session.server"
import { increaseLoginCount } from "~/models/user.server"

import WelcomeCard from "~/components/dashboard/WelcomeCard"

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  const isFirstLogin = user.loginCount === 0
  return json({ username: user.name, isFirstLogin, slug: user.slug })
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const action = formData.get("action")

  switch (action) {
    case "hideWelcomeText":
      await increaseLoginCount(user)
      break
  }

  return new Response(`Unsupported intent: ${action}`, { status: 400 })
}

export default function IndexRoute() {
  const { username, isFirstLogin, slug } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-4">
      <WelcomeCard
        username={username}
        isFirstLogin={isFirstLogin}
        slug={slug as string}
      />
    </div>
  )
}
