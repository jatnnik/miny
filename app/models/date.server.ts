import { Prisma } from "@prisma/client"
import type { User, Appointment, Participant } from "@prisma/client"
import { prisma } from "~/db.server"
import nodemailer from "nodemailer"
import { formatDate } from "~/utils"
import { formatInTimeZone } from "date-fns-tz"

const dateWithParticipants = Prisma.validator<Prisma.AppointmentArgs>()({
  include: {
    participants: {
      select: {
        id: true,
        name: true,
      },
    },
  },
})

export type DateWithParticipants = Prisma.AppointmentGetPayload<
  typeof dateWithParticipants
>

export async function isOwner(
  ownerId: Appointment["userId"],
  userId: User["id"]
) {
  return ownerId === userId
}

export async function getDateById(id: Appointment["id"]) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export async function getParticipateCount(id: Appointment["id"]) {
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

export async function getDateWithUserAndParticipants(id: Appointment["id"]) {
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

export async function getDatesByUserId(id: User["id"]) {
  return prisma.appointment.findMany({
    where: {
      userId: id,
      date: {
        gte:
          formatInTimeZone(new Date(), "Europe/Berlin", "yyyy-MM-dd") +
          "T00:00:00.000Z",
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export async function getFreeDates(userId: User["id"], onlyZoom = false) {
  if (onlyZoom) {
    return prisma.appointment.findMany({
      where: {
        userId,
        isAssigned: false,
        isZoom: true,
        date: {
          gte:
            formatInTimeZone(new Date(), "Europe/Berlin", "yyyy-MM-dd") +
            "T00:00:00.000Z",
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        participants: {
          select: {
            id: true,
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
            formatInTimeZone(new Date(), "Europe/Berlin", "yyyy-MM-dd") +
            "T00:00:00.000Z",
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }
}

export interface CreateFields {
  days: string[]
  isFlexible: boolean
  start?: string | null
  end?: string | null
  flexibleStart?: string | null
  isZoom: boolean
  isGroup: boolean
  maxParticipants?: number | null
  partner?: string | null
  note?: string | null
}

export async function createDates(fields: CreateFields, userId: User["id"]) {
  const data = fields.days.map(day => ({
    date: new Date(day),
    startTime: fields.isFlexible
      ? (fields.flexibleStart as string)
      : (fields.start as string),
    endTime: fields.isFlexible ? null : fields.end,
    isAssigned: !!fields.partner,
    isFlexible: fields.isFlexible,
    partnerName: fields.partner,
    isGroupDate: fields.isGroup,
    maxParticipants: fields.maxParticipants,
    note: fields.note,
    isZoom: fields.isZoom,
    userId,
  }))

  return await prisma.appointment.createMany({
    data,
  })
}

type CreateFieldsWithoutDays = Omit<CreateFields, "days">
export interface UpdateFields extends CreateFieldsWithoutDays {
  id: number
  day: string
  partner?: string | null
}

export async function updateDate(fields: UpdateFields) {
  return await prisma.appointment.update({
    where: {
      id: fields.id,
    },
    data: {
      date: new Date(fields.day),
      startTime: fields.isFlexible
        ? (fields.flexibleStart as string)
        : (fields.start as string),
      endTime: fields.end,
      isGroupDate: fields.isGroup,
      maxParticipants: fields.maxParticipants,
      note: fields.note,
      isFlexible: fields.isFlexible,
      partnerName: fields.partner,
      isAssigned: !!fields.partner,
      isZoom: fields.isZoom,
    },
  })
}

export async function removePartnerFromDate(id: Appointment["id"]) {
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

export async function removeGroupParticipant(id: Participant["id"]) {
  return await prisma.participant.delete({
    where: {
      id,
    },
  })
}

export async function safeDeleteDate(
  id: Appointment["id"],
  userId: User["id"]
) {
  const date = await getDateById(id)
  if (!date) return null

  const hasPermissionToDelete = await isOwner(date.userId, userId)
  if (!hasPermissionToDelete) {
    throw new Response("You are not allowed to delete this entity.", {
      status: 401,
    })
  }

  return await prisma.appointment.delete({
    where: {
      id,
    },
  })
}

export async function dateExistsAndIsAvailable(id: Appointment["id"]) {
  const appointment = await getDateWithUserAndParticipants(id)
  if (!appointment || appointment.isAssigned) return null
  return appointment
}

export async function assignDate(date: Appointment, name: string) {
  if (date.isGroupDate) {
    await prisma.participant.create({
      data: {
        name: name.trim(),
        dateId: date.id,
      },
    })

    const participants = await getParticipateCount(date.id)

    const reachedMaxParticipants = participants === date.maxParticipants
    if (reachedMaxParticipants) {
      return await prisma.appointment.update({
        where: {
          id: date.id,
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
        id: date.id,
      },
      data: {
        isAssigned: true,
        partnerName: name.trim(),
      },
    })
  }
}

export interface Recipient {
  email: User["email"]
  name: User["name"]
}

export async function sendAssignmentEmail(
  recipient: Recipient,
  partnerName: string,
  appointment: AppointmentWithUserAndParticipants,
  message?: string
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PW,
    },
  })

  const { isGroupDate } = appointment
  const subject = isGroupDate
    ? "Neuer Teilnehmer für Gruppentermin"
    : `Diensttermin mit ${partnerName}`

  let text = `Hi ${recipient.name}!\n\n`
  if (isGroupDate) {
    const participants = await getParticipateCount(appointment.id)
    text += `${partnerName} hat sich für einen Gruppentermin eingetragen. Ihr seid jetzt ${participants}/${appointment.maxParticipants} Teilnehmer.`
  } else {
    text += `${partnerName} hat sich für einen Diensttermin mit dir eingetragen.`
  }

  if (message) {
    text += `\n\nNachricht:\n`
    text += `${message}`
  }

  text += `\n\nEuer Termin:\n`
  text += `${formatDate(appointment.date)}, ${appointment.startTime}`
  if (appointment.endTime && !appointment.isFlexible) {
    text += `–${appointment.endTime}`
  }
  text += "\n\nViel Spaß im Dienst!\n\n"
  text += "Hier kommst du zu deinen Terminen: https://dienst.vercel.app/"

  await transporter.sendMail({
    from: '"miny" <my.miny.app@gmail.com>',
    to: recipient.email,
    subject,
    text,
  })
}
