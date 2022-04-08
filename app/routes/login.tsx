import React from 'react'
import {
  Form,
  Link,
  useActionData,
  useTransition,
  useSearchParams,
} from '@remix-run/react'
import {
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
  json,
  redirect,
} from '@remix-run/node'
import { createUserSession, getUserId } from '~/session.server'
import { badRequest, validateEmail } from '~/utils'
import { ErrorBadge } from '~/components/Badges'
import { labelStyles, inputStyles, errorStyles } from '~/components/Input'
import { SubmitButton } from '~/components/Buttons'
import { verifyLogin } from '~/models/user.server'

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (userId) return redirect('/')
  return json({})
}

interface ActionData {
  formError?: string
  errors?: {
    email?: string
    password?: string
  }
  fields?: {
    email: string
    password: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const email = formData.get('email')
  const password = formData.get('password')
  const redirectTo = formData.get('redirectTo')
  const remember = formData.get('remember')

  if (!validateEmail(email)) {
    return badRequest<ActionData>({
      errors: {
        email: 'Ungültige E-Mail',
      },
    })
  }

  if (typeof password !== 'string') {
    return badRequest<ActionData>({
      errors: {
        password: 'Passwort wird benötigt',
      },
    })
  }

  if (password.length < 6) {
    return badRequest<ActionData>({
      errors: {
        password: 'Passwort ist zu kurz',
      },
    })
  }

  const fields = {
    email,
    password,
    remember,
  }

  const user = await verifyLogin(email, password)

  if (!user) {
    return badRequest<ActionData>({
      formError: 'E-Mail oder Passwort ist falsch',
      fields,
    })
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === 'on' ? true : false,
    redirectTo: typeof redirectTo === 'string' ? redirectTo : '/',
  })
}

export const headers = () => {
  return {
    'Cache-Control': 's-maxage=604800',
  }
}

export const meta: MetaFunction = () => {
  return { title: 'Login' }
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const actionData = useActionData<ActionData>()
  const transition = useTransition()
  const emailRef = React.useRef<HTMLInputElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="block rounded-lg bg-red-400 bg-opacity-20 p-2">
        <img
          src="/backpack.png"
          className="h-8"
          alt="Rucksack Emoji"
          height={32}
          width={32}
        />
      </div>
      <div className="mt-6 w-full max-w-xs rounded-lg bg-white px-6 py-4 shadow-md sm:max-w-md">
        <Form method="post">
          {actionData?.formError ? (
            <ErrorBadge message={actionData.formError} />
          ) : null}

          <fieldset disabled={transition.state === 'submitting'}>
            <div>
              <label htmlFor={'email'} className={labelStyles}>
                E-Mail
              </label>

              <input
                ref={emailRef}
                type="email"
                id="email"
                name="email"
                className={inputStyles}
                required
                autoFocus={true}
                autoComplete="email"
                defaultValue={actionData?.fields?.email}
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
              />
              {actionData?.errors?.email && (
                <p className={errorStyles} role="alert" id="email-error">
                  {actionData.errors.email}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor={'password'} className={labelStyles}>
                Passwort
              </label>
              <input
                ref={passwordRef}
                type="password"
                id="password"
                name="password"
                className={inputStyles}
                required
                autoComplete="current-password"
                defaultValue={actionData?.fields?.password}
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              {actionData?.errors?.password && (
                <p className={errorStyles} role="alert" id="password-error">
                  {actionData.errors.password}
                </p>
              )}
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="mt-4 flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm font-medium"
              >
                Angemeldet bleiben
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1">
                <Link
                  className="block text-sm underline hover:text-slate-900"
                  to={{
                    pathname: '/register',
                    search: searchParams.toString(),
                  }}
                >
                  Registrieren
                </Link>
              </div>

              <SubmitButton
                type="submit"
                label={
                  transition.state === 'submitting' ? 'Lade...' : 'Anmelden'
                }
              />
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  )
}
