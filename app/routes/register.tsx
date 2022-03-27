import React from 'react'
import {
  Form,
  Link,
  type LoaderFunction,
  redirect,
  useActionData,
  type ActionFunction,
  useTransition,
  type MetaFunction,
  json,
  useSearchParams,
} from 'remix'
import { validateEmail, validateStringLength, badRequest } from '~/utils'

import Input from '~/components/Input'
import { SubmitButton } from '~/components/Buttons'
import { ErrorBadge } from '~/components/Badges'

// Types
interface ActionData {
  formError?: string
  errors?: {
    firstName?: string
    email?: string
    password?: string
    confirmPassword?: string
  }
  fields?: {
    firstName: string
    email: string
    password: string
    confirmPassword: string
  }
}

export const meta: MetaFunction = () => {
  return { title: 'Registrieren' }
}

// Redirect to dashboard if the user already has a valid session
export const loader: LoaderFunction = async ({ request }) => {
  // const sessionUser = await getUserSession(request)
  // if (sessionUser) {
  //   return redirect('/')
  // }

  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const firstName = formData.get('firstName')
  const email = formData.get('email')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')
  const redirectTo = formData.get('redirectTo')

  // Return early if one of the fields is undefined or not a string
  if (
    typeof firstName !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return badRequest<ActionData>({
      formError: 'Formular wurde nicht vollständig ausgefüllt',
    })
  }

  const fields = {
    firstName,
    email,
    password,
    confirmPassword,
    redirectTo,
  }

  const errors = {
    firstName: validateStringLength(firstName, 2),
    email: !validateEmail(email) ? 'Ungültige E-Mail' : undefined,
    password: validateStringLength(password, 6),
    confirmPassword:
      fields.confirmPassword !== fields.password
        ? 'Passwörter stimmen nicht überein'
        : undefined,
  }

  if (Object.values(errors).some(Boolean)) {
    return badRequest<ActionData>({ errors, fields })
  }

  console.log(fields)
  return null

  // Register the new user, create a session and redirect to dashboard
  // try {
  //   const { user } = await signUp(email, password)

  //   // Set the displayName after creating the user
  //   await updateProfile(user, { displayName: firstName })

  //   const token = await user.getIdToken()
  //   return createUserSession(token)
  // } catch (error) {
  //   if (error instanceof Error) {
  //     const message = error.message
  //     const emailIsTaken = message.includes('email-already-in-use')
  //     if (emailIsTaken) {
  //       return badRequest<ActionData>({
  //         formError: 'E-Mail wird bereits verwendet',
  //         fields,
  //       })
  //     }
  //   }
  //   return badRequest<ActionData>({
  //     formError: 'Ein Fehler ist aufgetreten',
  //     fields,
  //   })
  // }
}

export default function Register() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const actionData = useActionData<ActionData>()
  const transition = useTransition()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="block rounded-lg bg-red-400 bg-opacity-20 p-2">
        <img
          src="https://emojicdn.elk.sh/🎒"
          className="h-8"
          height={32}
          width={32}
        />
      </div>
      <div className="mt-6 w-full max-w-md rounded-lg bg-white px-6 py-4 shadow-md">
        <Form method="post">
          {actionData?.formError ? (
            <ErrorBadge message={actionData.formError} />
          ) : null}

          <fieldset disabled={transition.state === 'submitting'}>
            <Input
              type="text"
              name="firstName"
              label="Vorname"
              required
              autoFocus
              minLength={2}
              defaultValue={actionData?.fields?.firstName}
              validationError={actionData?.errors?.firstName}
              autoComplete="firstName"
            />

            <div className="mt-4">
              <Input
                type="email"
                name="email"
                label="E-Mail"
                required
                defaultValue={actionData?.fields?.email}
                validationError={actionData?.errors?.email}
                autoComplete="email"
              />
            </div>

            <div className="mt-4">
              <Input
                type="password"
                name="password"
                label="Passwort"
                required
                autoComplete="new-password"
                minLength={6}
                defaultValue={actionData?.fields?.password}
                validationError={actionData?.errors?.password}
              />
            </div>

            <div className="mt-4">
              <Input
                type="password"
                name="confirmPassword"
                label="Passwort bestätigen"
                required
                minLength={6}
                autoComplete="new-password"
                defaultValue={actionData?.fields?.confirmPassword}
                validationError={actionData?.errors?.confirmPassword}
              />
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1">
                <Link
                  className="block text-sm underline hover:text-slate-900"
                  to={{
                    pathname: '/login',
                    search: searchParams.toString(),
                  }}
                >
                  Login
                </Link>
              </div>

              <SubmitButton
                type="submit"
                label={
                  transition.state === 'submitting' ? 'Lade...' : 'Registrieren'
                }
              />
            </div>
          </fieldset>
        </Form>
      </div>
    </div>
  )
}
