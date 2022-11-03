import { json } from "@remix-run/node"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { z } from "zod"

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

export function validateDate(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false
  }

  const date = new Date(dateStr)
  const timestamp = date.getTime()

  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
    return false
  }

  return date.toISOString().startsWith(dateStr)
}

export function validateTime(timeStr: string) {
  return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)
}

export const isOnlySpaces = (str: string) => str.trim().length === 0

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

export const numeric = z.string().regex(/^\d+$/).transform(Number)
