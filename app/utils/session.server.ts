import { createCookieSessionStorage, redirect } from 'remix'
import { adminAuth, getSessionToken, signOutFirebase } from './db.server'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === 'production',
  },
})

async function createUserSession(idToken: string, redirectTo = '/') {
  const token = await getSessionToken(idToken)
  const session = await storage.getSession()
  session.set('token', token)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

async function getUserSession(request: Request) {
  const cookieSession = await storage.getSession(request.headers.get('Cookie'))
  const token = cookieSession.get('token')
  if (!token) return null

  try {
    const tokenUser = await adminAuth.verifySessionCookie(token, true)
    return tokenUser
  } catch (error) {
    return null
  }
}

async function destroyUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  const newCookie = await storage.destroySession(session)

  return redirect('/login', {
    headers: {
      'Set-Cookie': newCookie,
    },
  })
}

async function signOut(request: Request) {
  await signOutFirebase()
  return await destroyUserSession(request)
}

export { createUserSession, signOut, getUserSession }
