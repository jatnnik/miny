import { PrismaClient } from "@prisma/client"
import { createUser, createAdmin, createAppointment } from "./seed-utils"

const prisma = new PrismaClient()

async function seed() {
  console.log("🌱 Seeding...")
  console.time("🌱 Database has been seeded")

  console.time("🧹 Cleaned up the database...")
  await prisma.user.deleteMany({ where: {} })
  await prisma.appointment.deleteMany({ where: {} })
  await prisma.participant.deleteMany({ where: {} })
  await prisma.passwordResetToken.deleteMany({ where: {} })
  console.timeEnd("🧹 Cleaned up the database...")

  console.time("👤 Created users...")
  const userData = createUser()
  const user = await prisma.user.create({
    data: userData,
  })
  console.timeEnd("👤 Created users...")

  console.time("👮 Created admins...")
  const adminData = createAdmin()
  const admin = await prisma.user.create({
    data: adminData,
  })
  console.timeEnd("👮 Created admins...")

  console.time("🎒 Created appointments...")
  const userAppointment = createAppointment(user.id)
  const adminAppointment = createAppointment(admin.id)

  await prisma.appointment.createMany({
    data: [userAppointment, adminAppointment],
  })
  console.timeEnd("🎒 Created appointments...")

  console.timeEnd("🌱 Database has been seeded")
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/*
eslint
	@typescript-eslint/no-unused-vars: "off",
*/
