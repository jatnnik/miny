import type { User } from "@prisma/client"
import { useMatches } from "@remix-run/react"
import { useMemo } from "react"

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
  "password" | "updatedAt" | "createdAt" | "id"
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
