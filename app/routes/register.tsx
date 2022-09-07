import {
  Form,
  Link,
  useActionData,
  useTransition,
  useSearchParams,
} from "@remix-run/react"
import type {
  LoaderArgs,
  ActionFunction,
  MetaFunction,
  HeadersFunction,
} from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { getUserId, createUserSession } from "~/session.server"
import { createUser, getUserByEmail } from "~/models/user.server"
import { validateEmail, validateStringLength, badRequest } from "~/utils"

import Input from "~/components/Input"
import { SubmitButton } from "~/components/Buttons"
import { ErrorBadge } from "~/components/Badges"

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const firstName = formData.get("firstName")
  const email = formData.get("email")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")
  const redirectTo = formData.get("redirectTo")

  // Return early if one of the fields is undefined or not a string
  if (
    typeof firstName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return badRequest<ActionData>({
      formError: "Formular wurde nicht vollständig ausgefüllt",
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
    email: !validateEmail(email) ? "Ungültige E-Mail" : undefined,
    password: validateStringLength(password, 6),
    confirmPassword:
      fields.confirmPassword !== fields.password
        ? "Passwörter stimmen nicht überein"
        : undefined,
  }

  if (Object.values(errors).some(Boolean)) {
    return badRequest<ActionData>({ errors, fields })
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return badRequest<ActionData>({
      errors: {
        email: "E-Mail wird schon verwendet",
      },
    })
  }

  const user = await createUser(email, password, firstName)

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  })
}

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": `s-maxage=${60 * 60 * 24 * 30}`,
  }
}

export const meta: MetaFunction = () => {
  return {
    title: "Registrieren",
    "og:title": "Registrieren | miny",
  }
}

export default function Register() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"
  const actionData = useActionData<ActionData>()
  const transition = useTransition()

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

          <fieldset disabled={transition.state === "submitting"}>
            <Input
              type="text"
              name="firstName"
              label="Vorname"
              required
              autoFocus
              minLength={2}
              defaultValue={actionData?.fields?.firstName}
              validationError={actionData?.errors?.firstName}
              autoComplete="given-name"
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

            <div className="mt-4 flex items-center">
              <input
                id="agreeGdpr"
                name="agreeGdpr"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                required
              />
              <label
                htmlFor="agreeGdpr"
                className="ml-2 block text-sm font-medium"
              >
                Ich stimme der{" "}
                <Link
                  to="/privacy"
                  className="font-medium underline underline-offset-1 hover:no-underline"
                >
                  Datenschutzerklärung
                </Link>{" "}
                zu
              </label>
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="mt-4 flex items-center justify-between">
              <div className="space-y-1">
                <Link
                  className="block text-sm underline hover:text-slate-900"
                  to={{
                    pathname: "/login",
                    search: searchParams.toString(),
                  }}
                >
                  Login
                </Link>
              </div>

              <SubmitButton
                type="submit"
                label={
                  transition.state === "submitting" ? "Lade..." : "Registrieren"
                }
              />
            </div>
          </fieldset>
        </Form>
      </div>
      <Link
        to="/privacy"
        className="mt-4 text-center text-xs text-slate-500 underline"
      >
        Datenschutzerklärung
      </Link>
    </div>
  )
}
