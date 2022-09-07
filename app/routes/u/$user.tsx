import {
  useCatch,
  useLoaderData,
  useSearchParams,
  Link,
} from "@remix-run/react"
import type { LoaderArgs, ActionFunction, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { getUserBySlug } from "~/models/user.server"
import invariant from "tiny-invariant"
import {
  type DateWithParticipants,
  getFreeDates,
  dateExistsAndIsAvailable,
  assignDate,
  getDateById,
  sendAssignmentEmail,
} from "~/models/date.server"
import { badRequest, formatDate } from "~/utils"

import Container from "~/components/Container"
import Card from "~/components/Card"
import Header from "~/components/profile/Header"
import DateSlot from "~/components/profile/Date"

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.user, "Expected params.user")
  const username = params.user

  const url = new URL(request.url)
  const assigned = url.searchParams.get("assigned")
  const zoom = url.searchParams.get("zoom") === "on"

  let assignedDate = null
  if (typeof assigned === "string" && !isNaN(Number(assigned))) {
    assignedDate = await getDateById(Number(assigned))
  }

  const user = await getUserBySlug(username)
  if (user === null) {
    throw json("user not found", 404)
  }

  const dates = await getFreeDates(user.id, zoom)

  return json({
    user,
    dates,
    assignedDate,
  })
}

export interface ActionData {
  formError?: string
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData()
  const name = formData.get("name")
  const dateId = formData.get("dateId")

  if (
    typeof name !== "string" ||
    typeof dateId !== "string" ||
    isNaN(Number(dateId))
  ) {
    return badRequest<ActionData>({
      formError: "Fehlerhaftes Formular",
    })
  }

  const appointment = await dateExistsAndIsAvailable(Number(dateId))
  if (!appointment) {
    throw json("appointment not found or already assigned", 403)
  }

  await assignDate(Number(dateId), name)
  await sendAssignmentEmail(
    { email: appointment.user.email, name: appointment.user.name },
    name,
    appointment
  )

  return redirect(`/u/${params.user}?assigned=${dateId}`)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data?.user) {
    const title = `${data.user.name}${
      data.user.name.slice(-1) === "s" ? "'" : "s"
    } Diensttermine`

    return {
      title,
      "og:title": `${title} | miny`,
      "og:description": `${data.user.name} möchte einen Diensttermin mit dir ausmachen`,
    }
  } else {
    return {
      title: "Fehler",
      "og:title": "Fehler",
      "og:description": "Benutzer nicht gefunden",
    }
  }
}

export default function UserPage() {
  const { user, assignedDate, ...loaderData } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  const onlyZoom = searchParams.get("zoom") === "on"

  const { dates } = loaderData
  const showZoomFilter = dates.filter(date => date.isZoom).length > 0

  return (
    <div className="py-10">
      <Container>
        <Header />
        {assignedDate && (
          <Card withMarginTop>
            <h1 className="font-serif text-2xl font-black text-slate-700">
              Viel Spaß im Dienst!
            </h1>
            <p className="mt-4">Dein Termin mit {user.name}:</p>
            <p className="font-medium text-amber-800">
              {formatDate(assignedDate.date.toString())},{" "}
              {assignedDate.startTime}
              {assignedDate.endTime && `–${assignedDate.endTime}`}
            </p>
          </Card>
        )}
        <Card withMarginTop>
          <h1 className="font-serif text-2xl font-black text-slate-700">
            {!assignedDate
              ? `${user.name} möchte einen Diensttermin mit dir ausmachen`
              : `Möchtest du noch einen Termin mit ${user.name} ausmachen?`}
          </h1>
          {dates.length > 0 ? (
            <>
              <p className="mt-4">
                Tippe einfach auf das Kalender-Symbol, um dich für einen Termin
                einzutragen. {user.name} bekommt dann automatisch eine
                Nachricht.
              </p>
              {showZoomFilter && (
                <div className="mt-5">
                  {onlyZoom ? (
                    <Link
                      to="."
                      className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium ring-slate-100 transition duration-150 ease-in-out hover:bg-slate-300 focus:border-slate-100 focus:outline-none focus:ring active:bg-slate-300"
                    >
                      Alle Termine anzeigen
                    </Link>
                  ) : (
                    <Link
                      to="?zoom=on"
                      className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium ring-slate-100 transition duration-150 ease-in-out hover:bg-slate-300 focus:border-slate-100 focus:outline-none focus:ring active:bg-slate-300"
                    >
                      Nur Zoom Termine anzeigen
                    </Link>
                  )}
                </div>
              )}
              <h2 className="mt-10 font-serif text-xl font-black text-slate-700">
                Termine
              </h2>
              <div className="flex flex-col space-y-4 divide-y divide-dashed">
                {dates.map((date: DateWithParticipants) => (
                  <DateSlot date={date} key={date.id} />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 italic">
              Aktuell sind keine Termine eingetragen.
            </p>
          )}
        </Card>
      </Container>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  let errorMessage = `Ein Fehler ist aufgetreten: ${caught.status} ${caught.statusText}`

  switch (caught.status) {
    case 403:
      errorMessage =
        "Dieser Termin existiert nicht mehr oder es hat sich bereits jemand anderes eingetragen."
      break
    case 404:
      errorMessage = "Benutzer konnte nicht gefunden werden."
      break
  }

  return (
    <div className="py-10">
      <Container>
        <Header />
        <Card withMarginTop>{errorMessage}</Card>
      </Container>
    </div>
  )
}
