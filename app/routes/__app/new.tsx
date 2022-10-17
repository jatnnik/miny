import Card from "~/components/shared/Card"
import { Calendar, dayIsSelected } from "~/components/calendar"
import { headlineClasses } from "~/components/shared/Headline"
import { useState } from "react"

export default function AddDateRoute() {
  const [selectedDays, setSelectedDays] = useState<Date[]>([])

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

  return (
    <Card>
      <h1 className={headlineClasses}>Neuer Termin</h1>
      <div className="h-6"></div>
      <Calendar value={selectedDays} onSelect={onSelect} onReset={onReset} />
    </Card>
  )
}
