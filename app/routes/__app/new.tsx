import type { MetaFunction } from "@remix-run/node"
import React, { useState } from "react"
import { Form } from "@remix-run/react"
import { format } from "date-fns"
import { Switch } from "@headlessui/react"
import { motion } from "framer-motion"

import Card from "~/components/shared/Card"
import Input from "~/components/shared/Input"
import { Calendar, dayIsSelected } from "~/components/calendar"
import { headlineClasses } from "~/components/shared/Headline"
import { subtleButtonClasses } from "~/components/shared/Buttons"

const initialFormState = {
  isZoom: false,
  isFlexible: false,
  isGroup: false,
  manualPartner: false,
}

export const meta: MetaFunction = () => {
  return {
    title: "Neuer Termin",
  }
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
      <div className="h-8"></div>
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
        <fieldset className="text-sm disabled:opacity-60">
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
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1">
                  <Input name="start" label="Von" type="time" required />
                </div>
                <div className="flex-1">
                  <Input name="end" label="Bis" type="time" required />
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
              defaultValue={2}
              required={formState.isGroup}
            />
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
            />
          </motion.div>
          {/* Note */}
          <div className="h-6"></div>
          <Input label="Notiz" name="note" type="text" />
          {/* Submit */}
          <div className="h-10"></div>
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
