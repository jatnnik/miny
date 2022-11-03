import type { DateWithParticipants } from "~/models/date.server"
import {
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Form, useTransition } from "@remix-run/react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { motion } from "framer-motion"
import clsx from "clsx"

import Input from "../shared/Input"
import Button from "../shared/Buttons"
import LoadingSpinner from "../shared/LoadingSpinner"

interface Props {
  date: DateWithParticipants
  active: boolean
  onExpand: (id: number) => void
  username: string
  formError?: string
}

export function DateSlot({
  date,
  active,
  onExpand,
  username,
  formError,
}: Props) {
  const transition = useTransition()

  return (
    <div>
      <div className="flex items-start justify-between pt-4 sm:items-center">
        <div>
          <h3 className="flex items-center font-medium text-amber-800">
            {format(date.date, "EE, dd. MMMM", {
              locale: de,
            })}
            {date.isZoom && <VideoCameraIcon className="ml-1.5 h-4 w-4" />}
          </h3>
          <div className="h-1"></div>
          <div className="flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:gap-4">
            <div className="flex items-center">
              <ClockIcon className="mr-1 h-3.5 w-3.5" />
              {date.startTime}
              {!date.isFlexible && date.endTime && `-${date.endTime}`}
            </div>
            {date.isGroupDate && (
              <div className="flex items-center">
                <UsersIcon className="mr-1 h-3.5 w-3.5" />
                {date.participants.length}/{date.maxParticipants}
              </div>
            )}
            {date.note && (
              <div className="flex items-center">
                <ChatBubbleOvalLeftEllipsisIcon className="mr-1 h-3.5 w-3.5" />
                {date.note}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => onExpand(date.id)}
          className="flex items-center space-x-1 text-slate-600"
        >
          <div className="sr-only">Eintragen</div>
          <ChevronDownIcon
            className={clsx("h-10 w-10 p-2 transition-transform", {
              "rotate-180": active,
            })}
          />
        </button>
      </div>
      <motion.div
        initial={false}
        animate={{ height: active ? "auto" : 0 }}
        className="relative overflow-hidden"
        transition={{
          type: "spring",
          duration: 0.3,
          bounce: 0.1,
        }}
      >
        <div className="h-1"></div>
        {formError ? (
          <span className="mt-2 inline-block rounded-md bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-500">
            Fehler: {formError}
          </span>
        ) : null}
        <Form method="post" autoComplete="off">
          <fieldset className="space-y-4">
            <input type="hidden" name="id" value={date.id} />
            <div>
              <Input type="text" label="Dein Name*" name="name" required />
            </div>
            <div>
              <Input
                type="text"
                label={`Nachricht an ${username} (optional)`}
                name="message"
              />
            </div>
            <Button
              intent="submit"
              size="medium"
              variant="icon"
              className="normal-case tracking-normal"
            >
              Senden{transition.state === "submitting" && <LoadingSpinner />}
            </Button>
          </fieldset>
        </Form>
      </motion.div>
    </div>
  )
}
