import type { User, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'

export type DateWithParticipants = Prisma.DateGetPayload<{
  include: {
    participants: {
      select: {
        name: true
      }
    }
  }
}>

export async function getDatesByUserId(id: User['id']) {
  return prisma.date.findMany({
    where: {
      userId: id,
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

interface Fields {
  date: string
  startTime: string
  endTime?: string | null
  isGroupDate?: boolean
  maxParticipants?: number | null
  note?: string | null
}

export async function createDate(fields: Fields, userId: string) {
  return await prisma.date.create({
    data: {
      date: fields.date,
      startTime: fields.startTime,
      endTime: fields.endTime,
      isGroupDate: fields.isGroupDate,
      maxParticipants: fields.maxParticipants,
      note: fields.note,
      userId: Number(userId),
    },
  })
}
