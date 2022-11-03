import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { typedjson, useTypedLoaderData } from "remix-typedjson"
import invariant from "tiny-invariant"
import {
  Link,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react"
import { useState } from "react"
import { z } from "zod"

import type { DateWithParticipants, Recipient } from "~/models/date.server"
import type { inferSafeParseErrors } from "~/utils"
import {
  dateExistsAndIsAvailable,
  getFreeDates,
  assignDate,
  sendAssignmentEmail,
} from "~/models/date.server"
import { getUserBySlug } from "~/models/user.server"
import { formatDate, badRequest, getUserPageTitle } from "~/utils"

import Card from "~/components/shared/Card"
import { headlineClasses } from "~/components/shared/Headline"
import { DateSlot } from "~/components/userpage"
import { button } from "~/components/shared/Buttons"
import LoadingSpinner from "~/components/shared/LoadingSpinner"

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.user, "Expected params.user")
  const username = params.user

  const user = await getUserBySlug(username)
  if (user === null) {
    throw json("User not found", 404)
  }

  const dates = await getFreeDates(user.id)

  return typedjson({ user: user.name, dates })
}

const validationSchema = z.object({
  id: z.string().transform(Number),
  name: z.string().min(2, "Name muss mind. 2 Zeichen lang sein"),
  message: z.string().optional(),
})
type FieldErrors = inferSafeParseErrors<typeof validationSchema>

interface AssignedDate {
  date: string
  start: string
  end?: string
}

interface ActionData {
  errors?: FieldErrors
  assignedDate?: AssignedDate
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const fields = Object.fromEntries(formData.entries())

  // Validate incoming data
  const result = validationSchema.safeParse(fields)
  if (!result.success) {
    return badRequest<ActionData>({
      errors: result.error.flatten(),
    })
  }

  const { id, name: partner, message } = result.data

  // Check if date is still available
  const date = await dateExistsAndIsAvailable(id)
  if (!date) {
    throw new Response(
      "Dieser Termin existiert nicht oder wurde schon vergeben",
      { status: 403 }
    )
  }

  // Assign the partner
  await assignDate(date, partner)

  // Send the assignment email
  const mailRecipient: Recipient = {
    email: date.user.email,
    name: date.user.name,
  }
  await sendAssignmentEmail(mailRecipient, partner, date, message)

  return json({
    assignedDate: {
      date: date.date.toString(),
      start: date.startTime,
      end: date.isFlexible ? undefined : date.endTime,
    },
  })
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

interface DateListProps {
  dates: DateWithParticipants[]
  expandedDate: number | null
  handleExpand: (id: number) => void
  username: string
  formError?: string
}

function DateList({
  dates,
  expandedDate,
  handleExpand,
  username,
  formError,
}: DateListProps) {
  return (
    <>
      <h2 className="font-serif text-xl font-black text-slate-700">Termine</h2>
      <div className="space-y-4 divide-y">
        {dates.map(date => (
          <DateSlot
            key={date.id}
            date={date}
            active={date.id === expandedDate}
            onExpand={handleExpand}
            username={username}
            formError={formError}
          />
        ))}
      </div>
    </>
  )
}

function AssignedCard() {
  return (
    <Card>
      <h1 className={headlineClasses}>Viel Spaß im Dienst!</h1>
      {/* TODO: Show the date the user assigned for */}
      <div className="h-6"></div>
      <Link to="." className={button({ intent: "primary", size: "medium" })}>
        Zurück zu den Terminen
      </Link>
    </Card>
  )
}

export default function UserPage() {
  const { user, dates } = useTypedLoaderData<typeof loader>()
  const actionData = useActionData<ActionData>()
  const [searchParams] = useSearchParams()
  const transition = useTransition()

  const [expandedDate, setExpandedDate] = useState<number | null>(null)

  const isLoading = transition.state === "loading" && !transition.submission
  const onlyZoomParam = searchParams.get("onlyzoom")
  const onlyZoom = onlyZoomParam !== null
  const hasDates = dates.length > 0
  const showZoomFilter = dates.filter(date => date.isZoom).length > 0

  const assignedDate = !!actionData && !!actionData.assignedDate

  function handleExpand(id: number) {
    if (id === expandedDate) {
      setExpandedDate(null)
    } else {
      setExpandedDate(id)
    }
  }

  if (assignedDate) {
    return <AssignedCard />
  }

  return (
    <Card>
      <h1 className={headlineClasses}>{getUserPageTitle(user)}</h1>
      <div className="h-3"></div>
      {hasDates ? (
        <>
          <p className="italic">
            Tippe einfach auf den Pfeil, um dich für einen Termin einzutragen.{" "}
            {user} bekommt dann automatisch eine Nachricht.
          </p>
          {showZoomFilter ? (
            <>
              <div className="h-4"></div>
              {onlyZoom ? (
                <Link
                  to="."
                  key="all"
                  className={button({
                    intent: "primary",
                    size: "medium",
                    variant: "icon",
                  })}
                >
                  Alle Termine anzeigen {isLoading && <LoadingSpinner />}
                </Link>
              ) : (
                <Link
                  to="?onlyzoom"
                  key="zoom"
                  className={button({
                    intent: "primary",
                    size: "medium",
                    variant: "icon",
                  })}
                >
                  Nur Zoom Termine anzeigen {isLoading && <LoadingSpinner />}
                </Link>
              )}
            </>
          ) : null}
          <div className="h-8"></div>
          <DateList
            dates={onlyZoom ? dates.filter(date => date.isZoom) : dates}
            handleExpand={handleExpand}
            expandedDate={expandedDate}
            username={user}
            formError={
              actionData?.errors?.fieldErrors.name
                ? actionData?.errors?.fieldErrors.name[0]
                : undefined
            }
          />
        </>
      ) : (
        <p className="italic">Aktuell sind keine freien Termine eingetragen.</p>
      )}
    </Card>
  )
}
