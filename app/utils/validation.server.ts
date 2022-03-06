import { json } from 'remix'

export function validateString(value: unknown, minLength?: number) {
  if (minLength) {
    if (typeof value !== 'string' || value.length < minLength) {
      return `Muss mindestens ${minLength} Zeichen lang sein`
    }
  } else {
    if (typeof value !== 'string') {
      return 'Ungültiges Format'
    }
  }
}

export function badRequest<T>(data: T) {
  return json(data, { status: 400 })
}
