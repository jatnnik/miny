import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import type { Appointment } from "@prisma/client"
import { redirect } from "@remix-run/node"
import { typedjson, useTypedLoaderData } from "remix-typedjson"
import { Form, useTransition } from "@remix-run/react"
import { z } from "zod"
import { Switch } from "@headlessui/react"
import { useState } from "react"

import { getDateById } from "~/models/date.server"
import { requireUser } from "~/session.server"

import Card from "~/components/shared/Card"
import { headlineClasses } from "~/components/shared/Headline"
import { useUpdatedAt } from "~/hooks"
import { Calendar } from "~/components/calendar"

const numeric = z.string().regex(/^\d+$/).transform(Number)

interface LoaderData {
  date: Appointment
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request)
  const dateId = params.id

  const dateIdIsValid = numeric.safeParse(dateId)
  if (!dateIdIsValid.success) {
    return redirect("/")
  }

  const date = await getDateById(dateIdIsValid.data)
  if (!date || date.userId !== user.id) {
    return redirect("/")
  }

  return typedjson({ date })
}

export const meta: MetaFunction = () => {
  return {
    title: "Termin bearbeiten",
  }
}

export default function Edit() {
  const { date } = useTypedLoaderData<LoaderData>()
  const transition = useTransition()

  const initialFormState = {
    isZoom: date.isZoom,
    isFlexible: date.isFlexible,
    isGroup: date.isGroupDate,
    manualPartner: !!date.partnerName,
  }
  const [formState, setFormState] = useState(initialFormState)
  const [selectedDay, setSelectedDay] = useState([date.date])

  const updatedAt = useUpdatedAt(date.updatedAt)
  const isSubmitting = transition.state === "submitting"

  function onCalendarSelect(day: Date) {
    setSelectedDay([day])
  }

  function onCalendarReset() {
    setSelectedDay([date.date])
  }

  return (
    <Card>
      <h1 className={headlineClasses}>Termin bearbeiten</h1>
      <div className="h-2"></div>
      <p className="text-sm italic text-slate-500">
        Letzte Änderung: {updatedAt}
      </p>

      <div className="h-6"></div>
      <Form method="post" autoComplete="off">
        <fieldset disabled={isSubmitting}>
          <Calendar
            value={selectedDay}
            onSelect={onCalendarSelect}
            onReset={onCalendarReset}
            editMode={true}
          />
          <div className="h-8"></div>
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label>Flexible Zeit</Switch.Label>
              <Switch
                checked={formState.isFlexible}
                onChange={() =>
                  setFormState({
                    ...formState,
                    isFlexible: !formState.isFlexible,
                  })
                }
                name="isFlexible"
                className={`${
                  formState.isFlexible ? "bg-slate-700" : "bg-slate-300"
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formState.isFlexible ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>
        </fieldset>
      </Form>
    </Card>
  )
}
