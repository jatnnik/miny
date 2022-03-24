import {
  Form,
  Link,
  type LoaderFunction,
  redirect,
  useActionData,
  type ActionFunction,
  useTransition,
  type MetaFunction,
} from 'remix'
import { signUp } from '~/utils/db.server'
import { createUserSession, getUserSession } from '~/utils/session.server'
import { z } from 'zod'
import { validateString, badRequest } from '~/utils/validation.server'

import Input from '~/components/Input'
import { SubmitButton } from '~/components/Buttons'
import { ErrorBadge } from '~/components/Badges'
import Avatar from 'boring-avatars'
import React from 'react'
import { updateProfile } from 'firebase/auth'

// Types
interface ActionData {
  formError?: string
  fieldErrors?: {
    firstName: string | undefined
    email: string | undefined
    password: string | undefined
    confirmPassword: string | undefined
  }
  fields?: {
    firstName: string
    email: string
    password: string
    confirmPassword: string
  }
}

// Custom validations
function validateEmail(email: unknown) {
  const emailSchema = z.string().email()
  try {
    emailSchema.parse(email)
  } catch (error) {
    return 'Keine valide E-Mail Adresse'
  }
}

function validatePasswordConfirm(password: string, confirmPassword: unknown) {
  if (typeof confirmPassword !== 'string') {
    return 'Ungültiges Format'
  }

  if (confirmPassword !== password) {
    return 'Passwörter stimmen nicht überein'
  }
}

export const meta: MetaFunction = () => {
  return { title: 'Registrieren' }
}

// Redirect to dashboard if the user already has a valid session
export const loader: LoaderFunction = async ({ request }) => {
  const sessionUser = await getUserSession(request)
  if (sessionUser) {
    return redirect('/')
  }

  return null
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const firstName = formData.get('firstName')?.toString()
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const confirmPassword = formData.get('confirmPassword')?.toString()

  // Return early if one of the fields is undefined or not a string
  if (
    typeof firstName !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return badRequest({
      formError: 'Formular wurde nicht vollständig ausgefüllt',
    })
  }

  const fields = {
    firstName,
    email,
    password,
    confirmPassword,
  }

  const fieldErrors = {
    firstName: validateString(firstName, 2),
    email: validateEmail(email),
    password: validateString(password, 6),
    confirmPassword: validatePasswordConfirm(password, confirmPassword),
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest<ActionData>({ fieldErrors, fields })
  }

  // Register the new user, create a session and redirect to dashboard
  try {
    const { user } = await signUp(email, password)

    // Set the displayName after creating the user
    await updateProfile(user, { displayName: firstName })

    const token = await user.getIdToken()
    return createUserSession(token)
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message
      const emailIsTaken = message.includes('email-already-in-use')
      if (emailIsTaken) {
        return badRequest<ActionData>({
          formError: 'E-Mail wird bereits verwendet',
          fields,
        })
      }
    }
    return badRequest<ActionData>({
      formError: 'Ein Fehler ist aufgetreten',
      fields,
    })
  }
}

export default function Register() {
  const actionData = useActionData<ActionData>()
  const transition = useTransition()

  const [username, setUsername] = React.useState('')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Avatar
        size={48}
        name={username}
        variant="beam"
        colors={['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#405059']}
      />
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
              validationError={actionData?.fieldErrors?.firstName}
              onChange={e => setUsername(e.target.value)}
            />

            <div className="mt-4">
              <Input
                type="email"
                name="email"
                label="E-Mail"
                required
                defaultValue={actionData?.fields?.email}
                validationError={actionData?.fieldErrors?.email}
              />
            </div>

            <div className="mt-4">
              <Input
                type="password"
                name="password"
                label="Passwort"
                required
                autoComplete="current-password"
                minLength={6}
                defaultValue={actionData?.fields?.password}
                validationError={actionData?.fieldErrors?.password}
              />
            </div>

            <div className="mt-4">
              <Input
                type="password"
                name="confirmPassword"
                label="Passwort bestätigen"
                required
                minLength={6}
                defaultValue={actionData?.fields?.confirmPassword}
                validationError={actionData?.fieldErrors?.confirmPassword}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1">
                <Link
                  className="block text-sm text-slate-600 underline hover:text-slate-900"
                  to="/login"
                >
                  Anmelden
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
