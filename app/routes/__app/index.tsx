import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { typedjson, useTypedLoaderData } from "remix-typedjson"

import { requireUser } from "~/session.server"
import { hideNewsForUser, increaseLoginCount } from "~/models/user.server"
import { getDatesByUserId, safeDeleteDate } from "~/models/date.server"

import WelcomeCard from "~/components/dashboard/WelcomeCard"
import Dates from "~/components/dashboard/Dates"
import News from "~/components/news"

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  const isFirstLogin = user.loginCount === 0

  const dates = await getDatesByUserId(user.id)

  return typedjson({
    username: user.name,
    isFirstLogin,
    showNews: !user.hasSeenNews,
    slug: user.slug as string,
    dates,
  })
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const action = formData.get("action")

  switch (action) {
    case "hideWelcomeText":
      await increaseLoginCount(user)
      return null
    case "deleteDate":
      const id = formData.get("id")
      await safeDeleteDate(Number(id), user.id)
      return null
    case "hideNews":
      await hideNewsForUser(user.id)
      return null
  }

  return new Response(`Invalid intent: ${action}`, { status: 400 })
}

export default function IndexRoute() {
  const { username, isFirstLogin, showNews, slug, dates } =
    useTypedLoaderData<typeof loader>()

  return (
    <div className="space-y-6">
      {showNews && !isFirstLogin ? <News /> : null}
      <WelcomeCard
        username={username}
        isFirstLogin={isFirstLogin}
        slug={slug}
      />
      <Dates dates={dates} />
    </div>
  )
}
