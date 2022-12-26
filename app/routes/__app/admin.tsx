import type { DataFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { json } from "react-router"
import { requireAdmin } from "~/utils/session.server"
import { prisma } from "~/utils/db.server"

import Card from "~/components/shared/Card"
import Stat from "~/components/admin/Stat"
import React from "react"
import UserTable from "~/components/admin/UserTable"

function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      loginCount: true,
    },
  })
}

export type Users = Awaited<ReturnType<typeof getAllUsers>>

interface LoaderData {
  totalUsers: number
  totalAppointments: number
  totalLogins: string
  users: Users
}

export async function loader({ request }: DataFunctionArgs) {
  await requireAdmin(request)

  const totalAppointments = await prisma.appointment.count()

  const logins = await prisma.user.aggregate({
    _sum: {
      loginCount: true,
    },
  })
  const totalLogins = new Intl.NumberFormat("de-DE").format(
    Number(logins._sum.loginCount)
  )

  const users = await getAllUsers()

  return json<LoaderData>({
    totalUsers: users.length,
    totalAppointments,
    totalLogins,
    users,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: "Admin",
  }
}

function Label({ children }: React.PropsWithChildren) {
  return (
    <>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-sky-700">
        {children}
      </h2>
      <div className="h-3 sm:h-4"></div>
    </>
  )
}

export default function AdminDashboard() {
  // Hacky, but it works
  const data = useLoaderData() as unknown as LoaderData

  return (
    <div className="space-y-6">
      <Card>
        <div className="font-mono">
          <h1 className="text-lg font-bold text-sky-800">Admin Dashboard</h1>
          <div className="h-6"></div>
          <Label>Statistik</Label>
          <div className="grid grid-cols-3 gap-4">
            <Stat value={data.totalUsers} label="Benutzer" />
            <Stat value={data.totalAppointments} label="Termine" />
            <Stat value={data.totalLogins} label="Logins" />
          </div>
        </div>
      </Card>
      <Card>
        <Label>Benutzer</Label>
        <UserTable users={data.users} />
      </Card>
    </div>
  )
}
