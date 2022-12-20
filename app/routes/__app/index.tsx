import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { typedjson, useTypedLoaderData } from "remix-typedjson"

import { requireUserId } from "~/session.server"
import { hideNewsForUser, increaseLoginCount } from "~/models/user.server"
import { getDatesByUserId, safeDeleteDate } from "~/models/date.server"

import WelcomeCard from "~/components/dashboard/WelcomeCard"
import Dates from "~/components/dashboard/Dates"
import { useUser } from "~/utils"

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const dates = await getDatesByUserId(Number(userId))
  return typedjson({ dates })
}

export async function action({ request }: ActionArgs) {
  let userId = await requireUserId(request)
  const formData = await request.formData()
  const action = formData.get("action")

  switch (action) {
    case "hideWelcomeText":
      await increaseLoginCount(Number(userId))
      return null
    case "deleteDate":
      const id = formData.get("id")
      await safeDeleteDate(Number(id), Number(userId))
      return null
    case "hideNews":
      await hideNewsForUser(Number(userId))
      return null
  }

  return new Response(`Invalid intent: ${action}`, { status: 400 })
}

export default function IndexRoute() {
  const { dates } = useTypedLoaderData<typeof loader>()
  const user = useUser()

  return (
    <div className="space-y-6">
      <WelcomeCard
        username={user.name}
        isFirstLogin={user.loginCount === 0}
        slug={user.slug as string}
      />
      <Dates dates={dates} />
    </div>
  )
}
