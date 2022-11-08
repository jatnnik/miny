import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function resetNewsState() {
  const { count } = await prisma.user.updateMany({
    where: {
      hasSeenNews: true,
    },
    data: {
      hasSeenNews: false,
    },
  })

  console.log(`Successfully resetted news state for ${count} users ✅`)
}

resetNewsState()
