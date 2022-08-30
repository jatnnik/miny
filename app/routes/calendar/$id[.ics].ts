import type { LoaderFunction } from '@remix-run/node'
import { type EventAttributes, createEvents } from 'ics'
import type { Appointment } from '@prisma/client'

import { getDate, getMonth, getYear } from 'date-fns'
import { getDatesByUserId } from '~/models/date.server'

type DateArray = [number, number, number, number, number]

const convertFlexibleToTime = (flexibleTime: string) => {
  const value = flexibleTime.toLowerCase()

  if (value.includes('vormittag')) {
    return 10
  }

  if (value.includes('nachmittag')) {
    return 14
  }

  return 10
}

const getTitle = (appointment: Appointment) => {
  const { isAssigned, isGroupDate, partnerName } = appointment

  if (!isAssigned) {
    return 'Dienst (noch frei)'
  }

  if (isGroupDate) {
    return 'Gruppendienst'
  }

  if (!isGroupDate && partnerName) {
    return `Dienst mit ${partnerName}`
  }

  return 'Dienst (noch frei)'
}

const getStartDateArray = (appointment: Appointment): DateArray => {
  const DEFAULT_HOUR = 10

  const date = appointment.date
  const { isFlexible } = appointment

  const year = getYear(date)
  const month = getMonth(date) + 1
  const day = getDate(date)

  let hour = isFlexible
    ? convertFlexibleToTime(appointment.startTime)
    : appointment.startTime.split(':')[0]
  if (typeof hour === 'string') {
    hour = Number(hour)
  }
  if (typeof hour === 'undefined') {
    hour = DEFAULT_HOUR
  }

  let minutes = isFlexible ? 0 : appointment.startTime.split(':')[1]
  if (typeof minutes === 'string') {
    minutes = Number(minutes)
  }
  if (typeof minutes === 'undefined') {
    minutes = DEFAULT_HOUR
  }

  return [year, month, day, hour, minutes]
}

const getEndDateArray = (appointment: Appointment): DateArray => {
  const date = appointment.date
  const endTime = String(appointment.endTime)

  const year = getYear(date)
  const month = getMonth(date) + 1
  const day = getDate(date)

  let hour: string | number = endTime.split(':')[0]
  if (typeof hour === 'string') {
    hour = Number(hour)
  }

  let minutes: string | number = endTime.split(':')[1]
  if (typeof minutes === 'string') {
    minutes = Number(minutes)
  }

  return [year, month, day, hour, minutes]
}

const appointmentToEvent = (appointment: Appointment) => {
  const event: EventAttributes = {
    start: getStartDateArray(appointment),
    startOutputType: 'local',
    ...(appointment.isFlexible || !appointment.endTime
      ? { duration: { hours: 2, minutes: 0 } }
      : { end: getEndDateArray(appointment) }),
    endOutputType: 'local',
    title: getTitle(appointment),
    ...(appointment.isZoom ? { location: 'Zoom' } : {}),
    ...(appointment.note && { description: appointment.note }),
    status: 'CONFIRMED',
    alarms: [
      {
        action: 'display',
        description: 'Erinnerung',
        trigger: {
          hours: 0,
          minutes: 30,
          before: true,
        },
      },
    ],
    calName: 'miny',
  }

  return event
}

export const loader: LoaderFunction = async ({ params }) => {
  const id = params.id
  const data = await getDatesByUserId(Number(id))

  if (data.length === 0) {
    return new Response('no appointments yet', { status: 404 })
  }

  const eventData = data.map(appointment => appointmentToEvent(appointment))
  const { value: events } = createEvents(eventData)

  return new Response(events, {
    status: 200,
    headers: {
      'Content-Type': 'application/calendar',
    },
  })
}
