import { createCookieSessionStorage, redirect } from "@remix-run/node"

import { getUserById } from "./models/user.server"

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
})

const USER_SESSION_KEY = "userId"

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie")
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null
  return getUserById(Number(userId))
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<string> {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
    throw redirect(
      redirectTo && redirectTo !== "/" ? `/login?${searchParams}` : "/login"
    )
  }
  return userId
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = await getUserById(Number(userId))
  if (user) return user

  throw await logout(request)
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: number
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 30 // 30 days
          : undefined,
      }),
    },
  })
}

export async function logout(
  request: Request,
  redirectTo: string = request.url
) {
  const session = await getSession(request)
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
  return redirect(
    redirectTo && redirectTo !== "/" ? `/login?${searchParams}` : "/login",
    {
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    }
  )
}
