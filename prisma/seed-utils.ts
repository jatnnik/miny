import type * as P from "@prisma/client"
import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"

const createPassword = (password: string) => bcrypt.hashSync(password, 10)

type FakeUser = Omit<P.User, "id" | "createdAt" | "updatedAt">

const USER_PW = "minyuser"
const ADMIN_PW = "minyadmin"

export function createUser(): FakeUser {
  const gender = faker.helpers.arrayElement(["female", "male"]) as
    | "female"
    | "male"

  const firstName = faker.name.firstName(gender)
  const slug = faker.internet.userName(firstName).toLowerCase()

  return {
    email: "user@miny.app",
    name: firstName,
    password: createPassword(USER_PW),
    slug,
    loginCount: 0,
    calendarEnabled: false,
    calendarId: null,
    isAdmin: false,
  }
}

export function createAdmin(): FakeUser {
  const gender = faker.helpers.arrayElement(["female", "male"]) as
    | "female"
    | "male"

  const firstName = faker.name.firstName(gender)
  const slug = faker.internet.userName(firstName).toLowerCase()

  return {
    email: "admin@miny.app",
    name: firstName,
    password: createPassword(ADMIN_PW),
    slug,
    loginCount: 0,
    calendarEnabled: false,
    calendarId: null,
    isAdmin: true,
  }
}

export function createAppointment(
  userId: P.User["id"]
): Omit<P.Appointment, "id" | "createdAt" | "updatedAt"> {
  return {
    userId,
    date: faker.date.future(),
    startTime: "10:00",
    endTime: "12:00",
    isAssigned: false,
    isFlexible: false,
    isGroupDate: false,
    isZoom: false,
    note: null,
    partnerName: null,
    maxParticipants: null,
  }
}
