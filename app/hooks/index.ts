import { addDays, format, formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

export const useTomorrow = () => format(addDays(new Date(), 1), "yyyy-MM-dd")

export const useUpdatedAt = (updated: Date) => {
  return formatDistanceToNow(new Date(updated), {
    locale: de,
    addSuffix: true,
  })
}
