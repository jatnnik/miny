import type { User, Prisma, Appointment } from '@prisma/client'
import { prisma } from '~/db.server'
import nodemailer from 'nodemailer'
import { formatDate } from '~/utils'
import { formatInTimeZone } from 'date-fns-tz'

export type DateWithParticipants = Prisma.AppointmentGetPayload<{
  include: {
    participants: {
      select: {
        name: true
      }
    }
  }
}>

export async function isOwner(
  ownerId: Appointment['userId'],
  userId: User['id']
) {
  return ownerId === userId
}

export async function getDateById(id: Appointment['id']) {
  return prisma.appointment.findUnique({
    where: { id },
  })
}

export async function getParticipateCount(id: Appointment['id']) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  })

  if (!appointment) return null

  return appointment._count.participants
}

type AppointmentWithUserAndParticipants = Prisma.AppointmentGetPayload<{
  include: {
    user: {
      select: {
        email: true
        name: true
      }
    }
    _count: {
      select: {
        participants: true
      }
    }
  }
}>

export async function getDateWithUserAndParticipants(id: Appointment['id']) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      _count: {
        select: { participants: true },
      },
    },
  })
}

export async function getDatesByUserId(id: User['id']) {
  return prisma.appointment.findMany({
    where: {
      userId: id,
      date: {
        gte:
          formatInTimeZone(new Date(), 'Europe/Berlin', 'yyyy-MM-dd') +
          'T00:00:00.000Z',
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      participants: {
        select: {
          name: true,
        },
      },
    },
  })
}

export async function getFreeDates(userId: User['id'], onlyZoom = false) {
  if (onlyZoom) {
    return prisma.appointment.findMany({
      where: {
        userId,
        isAssigned: false,
        isZoom: true,
        date: {
          gte:
            formatInTimeZone(new Date(), 'Europe/Berlin', 'yyyy-MM-dd') +
            'T00:00:00.000Z',
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        participants: {
          select: {
            name: true,
          },
        },
      },
    })
  } else {
    return prisma.appointment.findMany({
      where: {
        userId,
        isAssigned: false,
        date: {
          gte:
            formatInTimeZone(new Date(), 'Europe/Berlin', 'yyyy-MM-dd') +
            'T00:00:00.000Z',
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        participants: {
          select: {
            name: true,
          },
        },
      },
    })
  }
}

interface CreateFields {
  date: string
  startTime: string
  endTime?: string | null
  isGroupDate?: boolean
  maxParticipants?: number | null
  note?: string | null
  isFlexible: boolean
  partner?: string | null
  isZoom: boolean
}

export async function createDate(fields: CreateFields, userId: string) {
  return await prisma.appointment.create({
    data: {
      date: fields.date,
      startTime: fields.startTime,
      endTime: fields.endTime,
      isGroupDate: fields.isGroupDate,
      maxParticipants: fields.maxParticipants,
      note: fields.note,
      userId: Number(userId),
      isFlexible: fields.isFlexible,
      partnerName: fields.partner,
      isAssigned: typeof fields.partner === 'string',
    },
  })
}

interface UpdateFields extends CreateFields {
  id: number
}

export async function updateDate(fields: UpdateFields) {
  return await prisma.appointment.update({
    where: {
      id: fields.id,
    },
    data: {
      date: fields.date,
      startTime: fields.startTime,
      endTime: fields.endTime,
      isGroupDate: fields.isGroupDate,
      maxParticipants: fields.maxParticipants,
      note: fields.note,
      isFlexible: fields.isFlexible,
      partnerName: fields.partner,
      isAssigned: typeof fields.partner === 'string',
      isZoom: fields.isZoom,
    },
  })
}

export async function removePartnerFromDate(id: Appointment['id']) {
  return await prisma.appointment.update({
    where: {
      id,
    },
    data: {
      isAssigned: false,
      partnerName: null,
    },
  })
}

export async function deleteDate(id: Appointment['id']) {
  const date = await getDateById(id)
  if (!date) return null

  return await prisma.appointment.delete({
    where: {
      id,
    },
  })
}

export async function dateExistsAndIsAvailable(id: Appointment['id']) {
  const appointment = await getDateWithUserAndParticipants(id)

  if (!appointment || appointment.isAssigned) return null

  return appointment
}

export async function assignDate(dateId: Appointment['id'], name: string) {
  const appointment = await getDateById(dateId)
  if (!appointment) return null

  if (appointment.isGroupDate) {
    await prisma.participant.create({
      data: {
        name: name.trim(),
        dateId,
      },
    })

    const participants = await getParticipateCount(dateId)

    const reachedMaxParticipants = participants === appointment.maxParticipants
    if (reachedMaxParticipants) {
      return await prisma.appointment.update({
        where: {
          id: dateId,
        },
        data: {
          isAssigned: true,
        },
      })
    }

    return null
  } else {
    return await prisma.appointment.update({
      where: {
        id: dateId,
      },
      data: {
        isAssigned: true,
        partnerName: name.trim(),
      },
    })
  }
}

interface Recipient {
  email: User['email']
  name: User['name']
}

export async function sendAssignmentEmail(
  recipient: Recipient,
  partnerName: string,
  appointment: AppointmentWithUserAndParticipants
) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PW,
    },
  })

  const { isGroupDate } = appointment
  const subject = isGroupDate
    ? 'Neuer Teilnehmer für Gruppentermin'
    : `Diensttermin mit ${partnerName}`

  let text = `Hi ${recipient.name}!\n\n`
  if (isGroupDate) {
    const participants = await getParticipateCount(appointment.id)
    text += `${partnerName} hat sich für einen Gruppentermin eingetragen. Ihr seid jetzt ${participants}/${appointment.maxParticipants} Teilnehmer.`
  } else {
    text += `${partnerName} hat sich für einen Diensttermin mit dir eingetragen.`
  }

  text += `\n\nEuer Termin:\n`
  text += `${formatDate(appointment.date.toString())}, ${appointment.startTime}`
  if (appointment.endTime && !appointment.isFlexible) {
    text += `–${appointment.endTime}`
  }
  text += '\n\nViel Spaß im Dienst!\nminy\n\n'
  text += 'Hier kommst du zu deinen Terminen: https://dienst.vercel.app/'

  await transporter.sendMail({
    from: '"miny" <my.miny.app@gmail.com>',
    to: recipient.email,
    subject,
    text,
  })
}
