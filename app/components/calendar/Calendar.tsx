import { useState } from "react"
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isPast,
  isToday,
  parse,
  startOfToday,
} from "date-fns"
import { de } from "date-fns/locale"
import clsx from "clsx"

import Button from "../shared/Buttons"

interface CalendarProps {
  value: Date[]
  max?: number
  onSelect: (day: Date) => void
  onReset: () => void
  editMode?: boolean
}

const monthFormat = "MMM yyyy"

export const dayIsSelected = (days: Date[], day: Date) => {
  const dateStrings = days.map(day => format(day, "yyyy-MM-dd"))
  const formattedDay = format(day, "yyyy-MM-dd")

  return dateStrings.includes(formattedDay)
}

export function Calendar({
  value,
  onSelect,
  onReset,
  max = 30,
  editMode = false,
}: CalendarProps) {
  const selectedDays = value
  const today = startOfToday()
  const initialMonth = format(editMode ? selectedDays[0] : today, monthFormat)
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const firstDayCurrentMonth = parse(currentMonth, monthFormat, new Date())

  const isCurrentMonth = currentMonth === format(today, monthFormat)
  const isDisabled = selectedDays.length === max

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  })

  function previousMonth() {
    const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayPrevMonth, monthFormat))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, monthFormat))
  }

  function handleSelectDay(day: Date) {
    onSelect(day)
  }

  function handleReset() {
    onReset()
    goToInitialMonth()
  }

  function goToInitialMonth() {
    setCurrentMonth(initialMonth)
  }

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div>
          {!editMode && (
            <>
              <p className="text-sm">Wähle einen oder mehrere Tage aus.</p>
              <p
                className={clsx("mt-1 text-xs", {
                  "text-slate-500": !isDisabled,
                  "text-rose-500": isDisabled,
                })}
              >
                {selectedDays.length}/{max}
              </p>
            </>
          )}
        </div>
        <div className="flex space-x-4">
          <Button
            onClick={goToInitialMonth}
            disabled={isCurrentMonth}
            variant="icon"
          >
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            Heute
          </Button>
          <Button
            onClick={handleReset}
            disabled={selectedDays.length === 0}
            variant="icon"
          >
            <XMarkIcon className="mr-1.5 h-4 w-4" />
            Zurücksetzen
          </Button>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-white p-2 text-sm shadow-md ring-1 ring-slate-200">
        <div className="mt-3 flex items-center justify-between px-8">
          <button
            type="button"
            disabled={isCurrentMonth}
            onClick={previousMonth}
            className="text-slate-400 hover:text-slate-500 disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Vorheriger Monat</span>
          </button>
          <h2 className="text-base font-semibold">
            {format(firstDayCurrentMonth, "MMMM yyyy", {
              locale: de,
            })}
          </h2>
          <button
            type="button"
            onClick={nextMonth}
            className="text-slate-400 hover:text-slate-500"
          >
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Nächster Monat</span>
          </button>
        </div>
        <div className="mt-6 grid grid-cols-7 text-center text-sm font-semibold leading-6 text-slate-400">
          <div>Mo</div>
          <div>Di</div>
          <div>Mi</div>
          <div>Do</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>So</div>
        </div>
        <div className="mt-2 grid grid-cols-7">
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={clsx(
                dayIdx === 0 && colStartClasses[getDay(day)],
                "py-2"
              )}
            >
              <button
                type="button"
                onClick={() => handleSelectDay(day)}
                disabled={
                  isPast(day) ||
                  (isDisabled && !dayIsSelected(selectedDays, day))
                }
                className={clsx(
                  isPast(day) && !isToday(day) && "text-slate-400",
                  isToday(day) && "font-semibold text-rose-500",
                  !isToday(day) && "disabled:opacity-70",
                  !isToday(day) &&
                    !isPast(day) &&
                    !dayIsSelected(selectedDays, day) &&
                    "hover:bg-slate-200",
                  !isToday(day) &&
                    dayIsSelected(selectedDays, day) &&
                    "bg-slate-700 text-white",
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                )}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>
                  {format(day, "d")}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const colStartClasses = [
  "col-start-7",
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
]
