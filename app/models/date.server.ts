import type { Date, User } from '@prisma/client'
import { prisma } from '~/db.server'

export type { Date } from '@prisma/client'

export async function getDatesByUserId(id: User['id']) {
  return prisma.date.findMany({
    where: {
      userId: id,
    },
    orderBy: {
      date: 'asc',
    },
  })
}
