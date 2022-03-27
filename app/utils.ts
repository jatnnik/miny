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
