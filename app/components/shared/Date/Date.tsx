import { Fragment, useState } from "react"
import type { DateWithParticipants } from "~/models/date.server"
import {
  ClockIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  UsersIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  VideoCameraIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"
import { Form, Link, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { formatDate } from "~/utils/misc"
import { Menu, Transition, Dialog } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"

import { itemClasses } from "../Menu/Menu"
import Button from "../Buttons"

interface DateProps {
  data: DateWithParticipants
  disableMenu?: boolean
}

interface DateMenuProps {
  id: DateWithParticipants["id"]
  date: string
  onDelete: () => void
}

function DateMenu({ id, date, onDelete }: DateMenuProps) {
  const [showModal, setShowModal] = useState(false)
  const transition = useTransition()

  return (
    <>
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm space-y-2 rounded bg-white p-6 shadow-md">
            <Dialog.Title className="font-semibold">
              Termin löschen
            </Dialog.Title>

            <p className="text-sm">
              Möchtest du deinen Termin am <i>{date}</i> wirklich löschen?
            </p>
            <div className="h-2"></div>
            <div className="flex space-x-4">
              <Button onClick={() => setShowModal(false)}>Doch nicht</Button>
              <Form method="post" onSubmit={onDelete}>
                <input type="hidden" name="id" value={id} />
                <Button
                  type="submit"
                  name="action"
                  value="deleteDate"
                  intent="warning"
                  size="medium"
                  disabled={transition.state === "submitting"}
                >
                  Ja
                </Button>
              </Form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
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
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className={clsx(
                      itemClasses,
                      "text-rose-500 hover:bg-rose-100"
                    )}
                  >
                    Löschen
                  </button>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  )
}

export default function Date({ data, disableMenu = false }: DateProps) {
  const [isVisible, setIsVisible] = useState(true)

  function handleDelete() {
    setIsVisible(false)
  }

  const formattedDate = formatDate(data.date)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={data.id}
          className="space-y-0.5 py-3 text-sm text-slate-600 first:pt-1 last:pb-0"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className={clsx("flex items-start justify-between", {
              "text-rose-700": data.isAssigned,
              "text-green-700": !data.isAssigned,
            })}
          >
            <div>
              <div className="flex items-center text-base font-medium">
                {formattedDate}
                {data.isZoom && <VideoCameraIcon className="ml-1.5 h-4 w-4" />}
              </div>
              {data.privateNote && (
                <div className="italic text-slate-500">{data.privateNote}</div>
              )}
            </div>
            {!disableMenu && (
              <DateMenu
                id={data.id}
                date={formattedDate}
                onDelete={handleDelete}
              />
            )}
          </div>
          <div className="flex flex-col gap-1 text-slate-600 sm:flex-row sm:gap-4">
            <div className="flex items-center">
              <ClockIcon className="mr-1 h-3.5 w-3.5" />
              {data.startTime}
              {!data.isFlexible && data.endTime && `-${data.endTime}`}
            </div>
            {data.isGroupDate && (
              <div className="flex items-center">
                <UsersIcon className="mr-1 h-3.5 w-3.5" />
                {data.participants.length}/{data.maxParticipants}
              </div>
            )}
            {data.isAssigned && !data.isGroupDate && (
              <div className="flex items-center">
                <UserIcon className="mr-1 h-3.5 w-3.5" />
                {data.partnerName}
              </div>
            )}
            {data.note && (
              <div className="flex items-center">
                <ChatBubbleOvalLeftEllipsisIcon className="mr-1 h-3.5 w-3.5" />
                {data.note}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
