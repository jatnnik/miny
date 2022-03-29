import { json } from 'remix'

export function badRequest<T>(data: T) {
  return json(data, { status: 400 })
}

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length > 3 && email.includes('@')
}

export function validateStringLength(value: string, minLength: number) {
  return value.length < minLength
    ? `Zu kurz (mind. ${minLength} Zeichen)`
    : undefined
}

export function validateDate(dateStr: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false
  }

  const date = new Date(dateStr)
  const timestamp = date.getTime()

  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    return false
  }

  return date.toISOString().startsWith(dateStr)
}

export function validateTime(timeStr: string) {
  return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)
}
