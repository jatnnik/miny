import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const updatePassword = async (userId: number, newPassword: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new Error(`No user with ID ${userId}`)
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedNewPassword,
    },
  })

  console.log(`Successfully updated password ✅`)
}
