import { useRef, useEffect } from "react"
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
import { json, redirect } from "@remix-run/node"
import { createUserSession, getUserId } from "~/session.server"
import type { inferSafeParseErrors } from "~/utils"
import { badRequest } from "~/utils"
import { verifyLogin } from "~/models/user.server"
import { z } from "zod"

import { ErrorBadge } from "~/components/Badges"
import { labelStyles, inputStyles, errorStyles } from "~/components/Input"
import { SubmitButton } from "~/components/Buttons"

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

const LoginSchema = z.object({
  email: z.string().min(1).email("Ungültige E-Mail"),
  password: z.string().min(6, "Passwort ist zu kurz"),
  redirectTo: z.string().optional(),
  remember: z.string(),
})
type LoginFields = z.infer<typeof LoginSchema>
type LoginFieldsErrors = inferSafeParseErrors<typeof LoginSchema>

interface ActionData {
  fields: LoginFields
  errors?: LoginFieldsErrors
  formError?: string
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const fields = Object.fromEntries(formData.entries()) as LoginFields
  const result = LoginSchema.safeParse(fields)

  if (!result.success) {
    return badRequest({
      fields,
      errors: result.error.flatten(),
    })
  }

  const user = await verifyLogin(fields.email, fields.password)
  if (!user) {
    return badRequest({
      fields,
      formError: "E-Mail oder Passwort ist falsch",
    })
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: fields.remember === "on" ? true : false,
    redirectTo: fields.redirectTo ? fields.redirectTo : "/",
  })
}

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": `s-maxage=${60 * 60 * 24 * 30}`,
  }
}

export const meta: MetaFunction = () => {
  return { title: "Login" }
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"
  const actionData = useActionData<ActionData>()
  const transition = useTransition()

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.fieldErrors.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.fieldErrors.password) {
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

          <fieldset disabled={transition.state === "submitting"}>
            <div>
              <label htmlFor={"email"} className={labelStyles}>
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
                aria-invalid={
                  actionData?.errors?.fieldErrors.email ? true : undefined
                }
                aria-describedby="email-error"
              />
              {actionData?.errors?.fieldErrors.email && (
                <p className={errorStyles} role="alert" id="email-error">
                  {actionData.errors.fieldErrors.email}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor={"password"} className={labelStyles}>
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
                aria-invalid={
                  actionData?.errors?.fieldErrors.password ? true : undefined
                }
                aria-describedby="password-error"
              />
              {actionData?.errors?.fieldErrors.password && (
                <p className={errorStyles} role="alert" id="password-error">
                  {actionData.errors.fieldErrors.password}
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
                    pathname: "/register",
                    search: searchParams.toString(),
                  }}
                >
                  Registrieren
                </Link>
              </div>

              <SubmitButton
                type="submit"
                label={
                  transition.state === "submitting" ? "Lade..." : "Anmelden"
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
