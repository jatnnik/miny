import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { typedjson, useTypedLoaderData } from "remix-typedjson"
import invariant from "tiny-invariant"

import Card from "~/components/shared/Card"
import { headlineClasses } from "~/components/shared/Headline"
import { getFreeDates } from "~/models/date.server"
import { getUserBySlug } from "~/models/user.server"
import { getUserPageTitle } from "~/utils"

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.user, "Expected params.user")
  const username = params.user

  const user = await getUserBySlug(username)
  if (user === null) {
    throw json("User not found", 404)
  }

  const dates = await getFreeDates(user.id)

  return typedjson({ user: user.name, dates })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data?.user) {
    const title = getUserPageTitle(data.user)

    return {
      title,
      "og:title": `${title} | miny`,
      "og:description": `${data.user} möchte einen Diensttermin mit dir ausmachen`,
    }
  } else {
    return {}
  }
}

export default function UserPage() {
  const { user, dates } = useTypedLoaderData<typeof loader>()

  const hasDates = dates.length > 0

  return (
    <Card>
      <h1 className={headlineClasses}>{getUserPageTitle(user)}</h1>
      <div className="h-3"></div>
      {hasDates ? (
        <p>
          Tippe einfach auf das Kalender-Symbol, um dich für einen Termin
          einzutragen. {user} bekommt dann automatisch eine Nachricht.
        </p>
      ) : (
        <p className="italic">Aktuell sind keine freien Termine eingetragen.</p>
      )}
    </Card>
  )
}
