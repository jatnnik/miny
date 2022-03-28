import type { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } })
}

export async function getUserBySlug(slug: string) {
  return prisma.user.findFirst({ where: { slug } })
}

export async function createUser(
  email: User['email'],
  password: string,
  name: string
) {
  const hashedPassword = await bcrypt.hash(password, 10)

  let slug = name.replace(' ', '-').toLowerCase()
  const existingSlug = await getUserBySlug(slug)
  if (existingSlug) {
    const randomSlug = crypto.randomBytes(5).toString('hex')
    slug = `${slug}-${randomSlug}`
  }

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      slug,
    },
  })
}

export async function verifyLogin(email: User['email'], password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return null
  }

  await prisma.user.update({
    where: {
      email,
    },
    data: {
      loginCount: user.loginCount + 1,
    },
  })

  const { password: _password, ...userWithoutPassword } = user

  return userWithoutPassword
}
