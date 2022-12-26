import type { Users } from "~/routes/__app/admin"
import React from "react"
import { Link } from "@remix-run/react"
import { format } from "date-fns"
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid"

function TableHeading({ children }: React.PropsWithChildren) {
  return <th className="border p-3 text-left">{children}</th>
}

function TableItem({ children }: React.PropsWithChildren) {
  return <td className="border border-slate-200 p-3">{children}</td>
}

export default function UserTable({ users }: { users: Users }) {
  function handleDelete() {
    alert("Möchtest du diesen Benutzer wirklich löschen?")
  }

  return (
    <table className="w-full table-auto border-collapse border border-slate-400 text-sm">
      <thead className="bg-slate-100">
        <tr>
          <TableHeading>Name</TableHeading>
          <TableHeading>E-Mail</TableHeading>
          <TableHeading>Logins</TableHeading>
          <TableHeading>Registriert</TableHeading>
          <TableHeading>Aktionen</TableHeading>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <TableItem>{user.name}</TableItem>
            <TableItem>{user.email}</TableItem>
            <TableItem>{user.loginCount}</TableItem>
            <TableItem>
              {format(new Date(user.createdAt), "dd.MM.yy")}
            </TableItem>
            <TableItem>
              <div className="flex items-center justify-center gap-3">
                <Link to={`edit/${user.id}`}>
                  <PencilSquareIcon className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                </Link>
                <button
                  className="text-slate-500 hover:text-slate-700"
                  onClick={handleDelete}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </TableItem>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
