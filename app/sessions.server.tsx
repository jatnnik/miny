import { createCookieSessionStorage } from 'remix'

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: 'fb:token',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.COOKIE_SECRET as string],
    secure: process.env.NODE_ENV === 'development' ? false : true,
  },
})

export const getUserSession = (request: Request) => {
  return getSession(request.headers.get('Cookie'))
}

export { getSession, commitSession, destroySession }
