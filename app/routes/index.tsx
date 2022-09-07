import { type LoaderArgs, type ActionArgs } from "@remix-run/node"
import type { TypedMetaFunction } from "remix-typedjson"
import { Link } from "@remix-run/react"
import { typedjson, useTypedLoaderData } from "remix-typedjson"
import { requireUser } from "~/session.server"
import { deleteDate, getDatesByUserId } from "~/models/date.server"
import { formatInTimeZone } from "date-fns-tz"
import { badRequest } from "~/utils"

import Container from "~/components/Container"
import Header from "~/components/dashboard/Header"
import Welcome from "~/components/dashboard/Welcome"
import Dates from "~/components/dashboard/Dates"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request)
  const dates = await getDatesByUserId(user.id)
  let greeting = "Hey"

  const currentHour = Number(
    formatInTimeZone(new Date(), "Europe/Berlin", "HH")
  )

  if (currentHour < 11 && currentHour > 4) {
    greeting = "Guten Morgen"
  } else if (currentHour > 18) {
    greeting = "Guten Abend"
  }

  return typedjson({ user, dates, greeting })
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const method = formData.get("_method")
  const dateId = formData.get("id")

  if (
    typeof method !== "string" ||
    typeof dateId !== "string" ||
    method !== "delete"
  ) {
    throw badRequest({ formError: "Ungültige Anfrage" })
  }

  await deleteDate(Number(dateId))
  return null
}

export const meta: TypedMetaFunction<typeof loader> = ({ data }) => {
  try {
    const { user } = data

    if (!user) {
      return {
        title: "Dashboard",
      }
    }

    return {
      title: `${user.name}${
        user.name.slice(-1) === "s" ? "'" : "s"
      } Diensttermine`,
    }
  } catch (error) {
    console.error(error)
    return {}
  }
}

export default function Dashboard() {
  const { user, dates, greeting } = useTypedLoaderData<typeof loader>()

  return (
    <div className="py-10">
      <Container>
        <Header username={user.name} />
        <Welcome user={user} greeting={greeting} />
        <Dates dates={dates} />
        <div className="mt-4 text-center text-xs text-slate-500">
          <span className="block">
            v1.0 &middot; Danke für die Idee, Linda!
          </span>
          <a
            href="https://github.com/wh1zk1d/miny/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noreferrer"
            title="Changelog"
            className="underline underline-offset-1"
          >
            Changelog
          </a>{" "}
          &middot;{" "}
          <Link to="/privacy" className="underline underline-offset-1">
            Datenschutzerklärung
          </Link>
        </div>
      </Container>
    </div>
  )
}
