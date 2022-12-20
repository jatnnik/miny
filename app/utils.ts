import { json } from "@remix-run/node"
import { useMatches } from "@remix-run/react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { useMemo } from "react"
import { z } from "zod"

import type { User } from "@prisma/client"

const DEFAULT_REDIRECT = "/"

export type inferSafeParseErrors<T extends z.ZodTypeAny, U = string> = {
  formErrors?: U[]
  fieldErrors: {
    [P in keyof z.infer<T>]?: U[]
  }
}

export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect
  }

  return to
}

export function badRequest<T>(data: T) {
  return json(data, { status: 400 })
}

export function formatDate(date: string | Date) {
  const dateFormat = "EE, dd. MMMM"
  let dateValue = date

  if (typeof dateValue === "string") {
    dateValue = new Date(date)
  }

  return format(dateValue, dateFormat, {
    locale: de,
  })
}

export function getUserPageTitle(username: string) {
  return `${username}${username.slice(-1) === "s" ? "" : "s"} Diensttermine`
}

export const numericSchema = z.coerce.number()

/**
 * Custom hook to quickly search for specific data across all loader data
 * using useMatches.
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find(route => route.id === id),
    [matchingRoutes, id]
  )

  return route?.data
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string"
}

export type PrunedUser = Omit<
  User,
  "password" | "updatedAt" | "createdAt" | "id" | "hasSeenNews"
>

export function useOptionalUser(): PrunedUser | undefined {
  const data = useMatchesData("root")
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser(): PrunedUser {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    )
  }
  return maybeUser
}
