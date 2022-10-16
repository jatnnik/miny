import Card from "~/components/shared/Card"
import { Calendar } from "~/components/calendar"
import { headlineClasses } from "~/components/shared/Headline"

export default function AddDateRoute() {
  return (
    <Card>
      <h1 className={headlineClasses}>Neuer Termin</h1>
      <div className="h-6"></div>
      <Calendar />
    </Card>
  )
}
