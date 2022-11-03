import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { typedjson, useTypedLoaderData } from "remix-typedjson"
import { Form, Link, useTransition } from "@remix-run/react"
import { z } from "zod"
import { Switch } from "@headlessui/react"
import { useState } from "react"
import { motion } from "framer-motion"

import type { inferSafeParseErrors } from "~/utils"
import { numeric } from "~/utils"
import type { DateWithParticipants, UpdateFields } from "~/models/date.server"
import { badRequest } from "~/utils"
import { removePartnerFromDate } from "~/models/date.server"
import { getDateById, updateDate } from "~/models/date.server"
import { requireUser, requireUserId } from "~/session.server"
import { baseDateSchema } from "../add"

import Card from "~/components/shared/Card"
import { headlineClasses } from "~/components/shared/Headline"
import { useUpdatedAt } from "~/hooks"
import { Calendar } from "~/components/calendar"
import Input from "~/components/shared/Input"
import Button from "~/components/shared/Buttons"
import LoadingSpinner from "~/components/shared/LoadingSpinner"
import { format } from "date-fns"
import { MinusCircleIcon } from "@heroicons/react/24/outline"

interface LoaderData {
  date: DateWithParticipants
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await requireUser(request)
  const dateId = params.id

  const dateIdIsValid = numeric.safeParse(dateId)
  if (!dateIdIsValid.success) {
    return redirect("/")
  }

  const date = await getDateById(dateIdIsValid.data)
  if (!date) {
    throw new Response("Not found", { status: 404 })
  }
  if (date.userId !== user.id) {
    throw new Response("No permission", { status: 403 })
  }

  return typedjson({ date })
}

export const meta: MetaFunction = () => {
  return {
    title: "Termin bearbeiten",
  }
}

const validationSchema = baseDateSchema
  .omit({ days: true })
  .extend({ day: z.string() })
type Fields = z.infer<typeof validationSchema>
type FieldErrors = inferSafeParseErrors<typeof validationSchema>

interface ActionData {
  fields: Fields
  errors?: FieldErrors
}

type Actions = "remove-participant" | "remove-partner" | null

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request)
  const dateId = params.id

  const dateIdIsValid = numeric.safeParse(dateId)
  if (!dateIdIsValid.success) {
    return redirect("/")
  }

  const validDateId = dateIdIsValid.data

  const date = await getDateById(validDateId)
  if (!date) {
    throw new Response("Not found", { status: 404 })
  }
  if (date.userId !== Number(userId)) {
    throw new Response("No permission", { status: 403 })
  }

  const formData = await request.formData()
  const action = formData.get("action") as Actions

  if (action === "remove-partner") {
    await removePartnerFromDate(validDateId)
    return redirect("/")
  }

  if (action === "remove-participant") {
    return redirect("/")
  }

  const fields = Object.fromEntries(formData.entries()) as any

  const result = validationSchema.safeParse(fields)
  if (!result.success) {
    return badRequest<ActionData>({
      fields,
      errors: result.error.flatten(),
    })
  }

  const validData = result.data
  const data: UpdateFields = {
    id: validDateId,
    day: validData.day,
    isFlexible: validData.isFlexible === "on",
    isGroup: validData.isGroup === "on",
    isZoom: validData.isZoom === "on",
    start: validData.isFlexible !== "on" ? validData.start : null,
    end: validData.isFlexible !== "on" ? validData.end : null,
    flexibleStart:
      validData.isFlexible === "on" ? validData.flexibleStart : null,
    maxParticipants:
      validData.isGroup === "on" ? Number(validData.maxParticipants) : null,
    partner: validData.manualPartner === "on" ? validData.partner : null,
    note: validData.note,
  }

  await updateDate(data)

  return redirect("/")
}

export default function Edit() {
  const { date } = useTypedLoaderData<LoaderData>()
  const transition = useTransition()

  const initialFormState = {
    isZoom: Boolean(date.isZoom),
    isFlexible: date.isFlexible,
    isGroup: date.isGroupDate,
    manualPartner: date.isAssigned && !!date.partnerName,
    showParticipants: false,
  }

  const [formState, setFormState] = useState(initialFormState)
  const [selectedDay, setSelectedDay] = useState([date.date])

  const updatedAt = useUpdatedAt(date.updatedAt)
  const isSubmitting = transition.state !== "idle"

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
        <input
          type="hidden"
          name="day"
          value={format(selectedDay[0], "yyyy-MM-dd")}
        />
        <fieldset
          className="text-sm transition-opacity disabled:opacity-60"
          disabled={isSubmitting}
        >
          <Calendar
            value={selectedDay}
            onSelect={onCalendarSelect}
            onReset={onCalendarReset}
            editMode
          />
          <div className="h-8"></div>
          <div className="space-y-6">
            {/* Flexible */}
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
            {/* Time */}
            {formState.isFlexible ? (
              <div>
                <Input
                  name="flexibleStart"
                  label='Zeit (z.B. "Vormittags")'
                  type="text"
                  required
                  defaultValue={date.startTime}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <Input
                    name="start"
                    label="Von"
                    type="time"
                    required
                    defaultValue={date.startTime}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    name="end"
                    label="Bis"
                    type="time"
                    defaultValue={date.endTime || undefined}
                  />
                </div>
              </div>
            )}
            {/* Zoom */}
            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label>Zoom Termin</Switch.Label>
                <Switch
                  checked={formState.isZoom}
                  onChange={() =>
                    setFormState({ ...formState, isZoom: !formState.isZoom })
                  }
                  name="isZoom"
                  className={`${
                    formState.isZoom ? "bg-slate-700" : "bg-slate-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span
                    className={`${
                      formState.isZoom ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          </div>
          {/* Group */}
          <div className="h-6"></div>
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label>Gruppentermin</Switch.Label>
              <Switch
                checked={formState.isGroup}
                onChange={() =>
                  setFormState({ ...formState, isGroup: !formState.isGroup })
                }
                disabled={formState.manualPartner}
                name="isGroup"
                className={`${
                  formState.isGroup ? "bg-slate-700" : "bg-slate-300"
                } relative inline-flex h-6 w-11 items-center rounded-full disabled:opacity-60`}
              >
                <span
                  className={`${
                    formState.isGroup ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>
          <motion.div
            initial={false}
            animate={{ height: formState.isGroup ? "auto" : 0 }}
            className="relative overflow-hidden"
            transition={{
              type: "spring",
              duration: 0.3,
              bounce: 0.1,
            }}
          >
            <div className="h-6"></div>
            <Input
              label="Maximale Teilnehmer (max. 50)"
              name="maxParticipants"
              type="number"
              max="50"
              min="2"
              maxLength={2}
              pattern="[0-9]"
              required={formState.isGroup}
              defaultValue={date.maxParticipants as number}
            />
            {date.participants.length > 0 ? (
              <>
                <div className="h-2"></div>
                <button
                  className="underline underline-offset-1"
                  type="button"
                  onClick={() =>
                    setFormState({
                      ...formState,
                      showParticipants: !formState.showParticipants,
                    })
                  }
                >
                  Teilnehmer{" "}
                  {formState.showParticipants ? "ausblenden" : "anzeigen"}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: formState.showParticipants ? "auto" : 0 }}
                  className="relative overflow-hidden"
                  transition={{
                    type: "spring",
                    duration: 0.3,
                    bounce: 0.1,
                  }}
                >
                  <div className="h-1"></div>
                  <ul className="space-y-2 divide-y">
                    {date.participants.map(participant => (
                      <li
                        key={participant.id}
                        className="flex items-center justify-between pt-2"
                      >
                        <span>{participant.name}</span>
                        <button
                          type="button"
                          className="text-rose-500 transition-colors hover:text-rose-600"
                          onClick={() =>
                            alert(
                              `Möchtest du ${participant.name} wirklich entfernen?`
                            )
                          }
                        >
                          <span className="sr-only">Entfernen</span>
                          <MinusCircleIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            ) : null}
          </motion.div>
          {/* Partner */}
          <div className="h-6"></div>
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label>Partner eintragen</Switch.Label>
              <Switch
                checked={formState.manualPartner}
                onChange={() =>
                  setFormState({
                    ...formState,
                    manualPartner: !formState.manualPartner,
                  })
                }
                disabled={formState.isGroup}
                name="manualPartner"
                className={`${
                  formState.manualPartner ? "bg-slate-700" : "bg-slate-300"
                } relative inline-flex h-6 w-11 items-center rounded-full disabled:opacity-60`}
              >
                <span
                  className={`${
                    formState.manualPartner ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>
          <motion.div
            initial={false}
            animate={{ height: formState.manualPartner ? "auto" : 0 }}
            className="relative overflow-hidden"
            transition={{
              type: "spring",
              duration: 0.3,
              bounce: 0.1,
            }}
          >
            <div className="h-6"></div>
            <Input
              label="Partner"
              name="partner"
              type="text"
              required={formState.manualPartner}
              defaultValue={date.partnerName as string}
            />
            {!!date.partnerName && (
              <Button
                type="submit"
                name="action"
                value="remove-partner"
                intent="warning"
                size="small"
                variant="icon"
                className="mt-3"
              >
                Partner entfernen {isSubmitting && <LoadingSpinner />}
              </Button>
            )}
          </motion.div>
          {/* Note */}
          <div className="h-6"></div>
          <Input
            label="Notiz"
            name="note"
            type="text"
            defaultValue={date.note || undefined}
          />
          {/* Submit */}
          <div className="h-10"></div>
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xs underline underline-offset-1">
              Zurück
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              intent="submit"
              variant="icon"
              size="small"
              name="action"
              value="update"
            >
              Speichern {isSubmitting && <LoadingSpinner />}
            </Button>
          </div>
        </fieldset>
      </Form>
    </Card>
  )
}
