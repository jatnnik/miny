import { json } from "@remix-run/node"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { z } from "zod"

export type inferSafeParseErrors<T extends z.ZodTypeAny, U = string> = {
  formErrors?: U[]
  fieldErrors: {
    [P in keyof z.infer<T>]?: U[]
  }
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

export const formatDate = (date: string) =>
  format(new Date(date), "EE dd. MMMM", {
    locale: de,
  })
