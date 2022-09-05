import {
  useCatch,
  useLoaderData,
  Form,
  useSubmit,
  useTransition,
} from "@remix-run/react"
import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node"
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
import type { Appointment } from "@prisma/client"
import { badRequest, formatDate } from "~/utils"

import Container from "~/components/Container"
import Card from "~/components/Card"
import Header from "~/components/profile/Header"
import DateSlot from "~/components/profile/Date"
import LoadingSpinner from "~/components/Spinner"

type LoaderData = {
  user: {
    id: number
    name: string
    email: string
    slug: string | null
  }
  dates: DateWithParticipants[]
  assignedDate: Appointment | null
  onlyZoom: boolean
  showZoomFilter: boolean
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const username = params.user
  invariant(username, "Invalid user slug")

  const url = new URL(request.url)
  const assigned = url.searchParams.get("assigned")
  const onlyZoom = url.searchParams.get("onlyZoom") === "on"

  let assignedDate = null

  if (typeof assigned === "string" && !isNaN(Number(assigned))) {
    assignedDate = await getDateById(Number(assigned))
  }

  const user = await getUserBySlug(username)
  if (user === null) {
    throw json("user not found", 404)
  }

  const dates = await getFreeDates(user.id, onlyZoom)
  const showZoomFilter = dates.filter(date => date.isZoom).length > 0

  return json<LoaderData>({
    user,
    dates,
    assignedDate,
    onlyZoom,
    showZoomFilter,
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

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined
}) => {
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
  const { user, assignedDate, ...loaderData } = useLoaderData<LoaderData>()
  const transition = useTransition()
  const submit = useSubmit()

  const { dates } = loaderData

  const handleFilterChange = (event: React.ChangeEvent<HTMLFormElement>) => {
    submit(event.currentTarget, { replace: true })
  }

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
              {loaderData.showZoomFilter && (
                <Form
                  method="get"
                  className="my-4"
                  onChange={handleFilterChange}
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="onlyZoom"
                      defaultChecked={loaderData.onlyZoom}
                      className="mr-2 h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                    />{" "}
                    Nur Zoom Termine zeigen{" "}
                    {transition.state === "submitting" && <LoadingSpinner />}
                  </label>
                </Form>
              )}
              <h2 className="mt-8 font-serif text-xl font-black text-slate-700">
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
