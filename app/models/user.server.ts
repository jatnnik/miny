import type { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

export type PublicUser = {
  id: number
  name: string
  email: string
  slug: string | null
  loginCount: number
}

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      loginCount: true,
    },
  })
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
    },
  })
}

export async function getUserBySlug(slug: string) {
  return prisma.user.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
    },
  })
}

export async function createUser(
  email: User['email'],
  password: string,
  name: string
) {
  const hashedPassword = await bcrypt.hash(password, 10)

  let slug = name.trim().replace(' ', '-').toLowerCase()
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
