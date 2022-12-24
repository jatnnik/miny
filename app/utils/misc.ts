import { format } from "date-fns"
import { de } from "date-fns/locale"

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
  return `${username}${
    ["s", "ß", "x", "z"].includes(username.slice(-1)) ? "'" : "s"
  } Diensttermine`
}
