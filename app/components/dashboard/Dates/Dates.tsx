import type { DateWithParticipants } from "~/models/date.server"
import { Link } from "@remix-run/react"
import { PlusIcon } from "@heroicons/react/20/solid"

import Card from "~/components/shared/Card"
import { headlineClasses } from "~/components/shared/Headline"
import Date from "~/components/shared/Date"

interface DatesProps {
  dates: Array<DateWithParticipants>
}

export default function Dates({ dates }: DatesProps) {
  const hasDates = dates.length > 0

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className={headlineClasses}>Termine</h2>
        <Link
          to="add"
          className="flex items-center rounded-md bg-green-50 px-3 py-1.5 pr-2 text-sm font-medium text-green-700 hover:bg-green-100"
        >
          <span>Erstellen</span>
          <PlusIcon aria-hidden="true" className="ml-1.5 h-4 w-4" />
        </Link>
      </div>
      <div className="h-2"></div>
      {hasDates ? (
        <div className="divide-y">
          {dates.map(entry => (
            <Date key={entry.id} data={entry} />
          ))}
        </div>
      ) : (
        <>
          <div className="h-4"></div>
          <i className="text-sm">Du hast aktuell keine Termine eingetragen.</i>
        </>
      )}
    </Card>
  )
}
