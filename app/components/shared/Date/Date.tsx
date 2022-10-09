import { Fragment, useState } from "react"
import type { DateWithParticipants } from "~/models/date.server"
import {
  ClockIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  UsersIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"
import { Form, Link, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { formatDate } from "~/utils"
import { Menu, Transition } from "@headlessui/react"

import { itemClasses } from "../Menu/Menu"

interface DateProps {
  data: DateWithParticipants
}

interface DateMenuProps {
  id: DateWithParticipants["id"]
  onDelete: () => void
}

function DateMenu({ id, onDelete }: DateMenuProps) {
  const transition = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("Möchtest du diesen Termin wirklich löschen?")) {
      return event.preventDefault()
    }
    onDelete()
  }

  return (
    <div className="w-28 text-right text-slate-600">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="focus:outline-none">
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-0 w-28 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-0.5 py-0.5 ">
              <Menu.Item>
                <Link to={`edit/${id}`} className={itemClasses}>
                  Bearbeiten
                </Link>
              </Menu.Item>
            </div>
            <div className="px-0.5 py-0.5">
              <Menu.Item>
                <Form method="post" onSubmit={handleSubmit}>
                  <input type="hidden" name="id" value={id} />
                  <button
                    type="submit"
                    name="action"
                    value="deleteDate"
                    disabled={transition.state !== "idle"}
                    className={clsx(itemClasses, "text-rose-500")}
                  >
                    Löschen
                  </button>
                </Form>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default function Date({ data }: DateProps) {
  const [show, setShow] = useState(true)

  function handleDelete() {
    setShow(false)
  }

  if (!show) {
    return null
  }

  return (
    <div className="space-y-1 py-3 text-sm text-slate-600">
      <div
        className={clsx("flex items-center justify-between", {
          "text-rose-700": data.isAssigned,
          "text-green-700": !data.isAssigned,
        })}
      >
        <div>
          <div className="flex items-center text-base font-medium">
            {formatDate(data.date)}
            {data.isZoom && <VideoCameraIcon className="ml-1.5 h-3.5 w-3.5" />}
          </div>
        </div>
        <DateMenu id={data.id} onDelete={handleDelete} />
      </div>
      <div className="flex gap-4 text-slate-600">
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
      {data.isAssigned && !data.isGroupDate && (
        <div className="flex items-center">
          <UserIcon className="mr-1 h-3.5 w-3.5" />
          {data.partnerName}
        </div>
      )}
      {data.note && (
        <div className="flex items-center">
          <DocumentTextIcon className="mr-1 h-3.5 w-3.5" />
          {data.note}
        </div>
      )}
    </div>
  )
}
