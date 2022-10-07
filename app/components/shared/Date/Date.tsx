import type { DateWithParticipants } from "~/models/date.server"
import {
  ClockIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
  UserIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { formatDate } from "~/utils"

interface DateProps {
  data: DateWithParticipants
}

export default function Date({ data }: DateProps) {
  return (
    <div className="space-y-1 py-3 text-sm text-slate-500">
      <div
        className={clsx("flex items-center justify-between", {
          "text-rose-700": data.isAssigned,
          "text-green-700": !data.isAssigned,
        })}
      >
        <div>
          <div className="flex items-center text-base font-medium">
            {formatDate(data.date)}
            {data.isZoom && <VideoCameraIcon className="ml-2 h-3.5 w-3.5" />}
          </div>
          <div className="h-1"></div>
          <div className="flex gap-4 text-slate-500">
            <div className="flex items-center">
              <ClockIcon className="mr-1 h-3.5 w-3.5" />
              {data.startTime}
              {data.endTime && `-${data.endTime}`}
            </div>
            {data.isGroupDate && (
              <div className="flex items-center">
                <UsersIcon className="mr-1 h-3.5 w-3.5" />
                {data.participants.length}/{data.maxParticipants}
              </div>
            )}
          </div>
        </div>
        <div className="text-slate-500">
          <Link to={`edit/${data.id}`}>
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
      {data.isAssigned && !data.isGroupDate && (
        <div className="flex items-center">
          <UserIcon className="mr-1 h-3.5 w-3.5" />
          {data.partnerName}
        </div>
      )}
      {data.note && (
        <div className="flex items-center">
          <InformationCircleIcon className="mr-1 h-3.5 w-3.5" />
          {data.note}
        </div>
      )}
    </div>
  )
}
