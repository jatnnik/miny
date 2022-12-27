import type { Users } from "~/routes/__app/admin"
import React from "react"
import {
  Form,
  useFetcher,
  useSearchParams,
  useSubmit,
  useTransition,
} from "@remix-run/react"
import { format } from "date-fns"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  TrashIcon,
} from "@heroicons/react/20/solid"

import LoadingSpinner from "~/components/shared/LoadingSpinner"

function TableHeading({ children }: React.PropsWithChildren) {
  return <th className="border p-3 text-left">{children}</th>
}

function TableItem({ children }: React.PropsWithChildren) {
  return <td className="border border-slate-200 p-3">{children}</td>
}

interface Props {
  users: Users
  activePage: number
  pages: number
}

export default function UserTable({ users, activePage, pages }: Props) {
  const [searchParams] = useSearchParams()
  const orderBy = searchParams.get("orderBy") ?? "id"
  const sort = searchParams.get("sort") ?? "asc"

  const transition = useTransition()
  const submit = useSubmit()
  const fetcher = useFetcher()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm("Möchtest du diesen Nutzer wirklich löschen?")) {
      event.preventDefault()
    }
  }

  return (
    <>
      {/* Filters */}
      <Form
        method="get"
        onChange={e => submit(e.currentTarget)}
        className="flex items-center gap-2"
      >
        <select
          name="orderBy"
          defaultValue={orderBy}
          className="border-slate-500 text-xs text-slate-500"
        >
          <option value="id">ID</option>
          <option value="loginCount">Logins</option>
          <option value="createdAt">Registriert</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="border-slate-500 text-xs text-slate-500"
        >
          <option value="asc">Aufsteigend</option>
          <option value="desc">Absteigend</option>
        </select>
        <input type="hidden" name="page" value={1} />
        {transition.state === "submitting" ? <LoadingSpinner /> : null}
      </Form>
      <div className="h-3"></div>
      {/* Table */}
      <div className="overflow-x-scroll">
        <table className="w-full table-auto border-collapse border border-slate-400 text-xs sm:text-sm">
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
                  <div className="flex items-center justify-center">
                    <fetcher.Form method="post" onSubmit={handleSubmit} replace>
                      <button
                        type="submit"
                        name="userId"
                        value={user.id}
                        disabled={
                          fetcher.state === "submitting" &&
                          Number(fetcher.submission.formData.get("userId")) ===
                            user.id
                        }
                        className="text-slate-500 hover:text-slate-700 disabled:opacity-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </fetcher.Form>
                  </div>
                </TableItem>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="h-3"></div>
      <div className="flex items-center justify-between text-xs">
        <Form>
          <input type="hidden" name="orderBy" value={orderBy} />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="page" value={activePage - 1} />
          <button
            type="submit"
            disabled={activePage === 1}
            className="disabled:opacity-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
        </Form>
        <div>
          {activePage}/{pages}
        </div>
        <Form>
          <input type="hidden" name="orderBy" value={orderBy} />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="page" value={activePage + 1} />
          <button
            type="submit"
            disabled={activePage === pages}
            className="disabled:opacity-50"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </Form>
      </div>
    </>
  )
}
