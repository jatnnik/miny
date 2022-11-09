import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

export const useUpdatedAt = (updated: Date) => {
  return formatDistanceToNow(new Date(updated), {
    locale: de,
    addSuffix: true,
  })
}
