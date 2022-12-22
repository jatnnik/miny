import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const userData = {
  email: "jannik@miny.app",
  name: "Jannik",
  slug: "jannik",
  password: "minyiscool",
}

async function seed() {
  console.log("👤 Creating a user...")
  console.time()
  await prisma.user.delete({ where: { email: userData.email } }).catch(() => {})

  const dateFromSeedUser = await prisma.appointment.findFirst({
    where: {
      user: {
        email: userData.email,
      },
    },
  })

  if (dateFromSeedUser) {
    await prisma.appointment
      .delete({ where: { id: dateFromSeedUser.id } })
      .catch(() => {})
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      slug: userData.slug,
    },
  })

  console.timeEnd()

  console.log("\n🗓️ Creating appointments...")
  console.time()
  await prisma.appointment.create({
    data: {
      userId: user.id,
      date: new Date("2024-03-01").toISOString(),
      startTime: "10:00",
    },
  })
  console.timeEnd()

  console.log(`\nDatabase has been seeded. 🌱`)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
