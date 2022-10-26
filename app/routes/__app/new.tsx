import React, { useState } from "react"
import { Form } from "@remix-run/react"
import { format } from "date-fns"
import { Switch } from "@headlessui/react"

import Card from "~/components/shared/Card"
import { Calendar, dayIsSelected } from "~/components/calendar"
import { headlineClasses } from "~/components/shared/Headline"
import { subtleButtonClasses } from "~/components/shared/Buttons"

const initialFormState = {
  isZoom: false,
  isFlexible: false,
  isGroup: false,
  manualPartner: false,
}

export default function AddDateRoute() {
  const [selectedDays, setSelectedDays] = useState<Date[]>([])
  const [formState, setFormState] = useState(initialFormState)

  const submitIsDisabled = selectedDays.length === 0

  function onSelect(day: Date) {
    if (dayIsSelected(selectedDays, day)) {
      setSelectedDays(selectedDays.filter(d => d.toString() !== day.toString()))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  function onReset() {
    setSelectedDays([])
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const days = formData.getAll("selectedDay")
    const { selectedDay, ...fields } = Object.fromEntries(formData)
    const data = { ...fields, days }
    console.log(data)
  }

  return (
    <Card>
      <h1 className={headlineClasses}>Neuer Termin</h1>
      <div className="h-6"></div>
      <Calendar
        value={selectedDays}
        onSelect={onSelect}
        onReset={onReset}
        max={10}
      />
      <div className="h-6"></div>
      <Form method="post" onSubmit={handleSubmit}>
        {/* Map the selected days to hidden inputs */}
        {selectedDays.length > 0 &&
          selectedDays.map((day, i) => (
            <input
              key={i}
              type="hidden"
              name="selectedDay"
              value={format(day, "yyyy-MM-dd")}
            />
          ))}
        <fieldset className="space-y-6 text-sm disabled:opacity-60">
          {/* Flexible */}
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label>Zeit ist flexibel</Switch.Label>
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
            <>
              <label htmlFor="flexibleTime">Zeit (z.B. "Vormittags")</label>
              <input type="text" name="flexibleTime" id="flexibleTime" />
            </>
          ) : (
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <label htmlFor="start" className="block">
                  Von
                </label>
                <input
                  type="time"
                  name="start"
                  id="start"
                  className="w-full"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="end" className="block">
                  Bis
                </label>
                <input type="time" name="end" id="end" className="w-full" />
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
          {/* Group */}
          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label>Gruppentermin</Switch.Label>
              <Switch
                checked={formState.isGroup}
                onChange={() =>
                  setFormState({ ...formState, isGroup: !formState.isGroup })
                }
                name="isGroup"
                className={`${
                  formState.isGroup ? "bg-slate-700" : "bg-slate-300"
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    formState.isGroup ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </Switch.Group>
          {/* Submit */}
          <div className="h-1"></div>
          <button
            type="submit"
            className={subtleButtonClasses}
            disabled={submitIsDisabled}
          >
            Speichern
          </button>
        </fieldset>
      </Form>
    </Card>
  )
}
