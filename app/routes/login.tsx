import type { inferSafeParseErrors } from "~/utils"
import { useRef, useEffect } from "react"
import {
  Form,
  Link,
  useActionData,
  useTransition,
  useSearchParams,
} from "@remix-run/react"
import type { LoaderArgs, ActionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { z } from "zod"

import { createUserSession, getUserId } from "~/session.server"
import { badRequest } from "~/utils"
import { verifyLogin } from "~/models/user.server"

import { ErrorBadge } from "~/components/Badges"
import { labelStyles, inputStyles, errorStyles } from "~/components/Input"
import { SubmitButton } from "~/components/Buttons"
import Backpack from "~/components/Backpack"

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

const validationSchema = z.object({
  email: z.string().min(1).email("Ungültige E-Mail"),
  password: z.string().min(6, "Passwort muss mind. 6 Zeichen lang sein"),
  redirectTo: z.string().default("/"),
  remember: z.enum(["on"]).optional(),
})
type LoginFields = z.infer<typeof validationSchema>
type LoginFieldErrors = inferSafeParseErrors<typeof validationSchema>

interface ActionData {
  fields: LoginFields
  errors?: LoginFieldErrors
  formError?: string
}

export const action = async ({ request }: ActionArgs) => {
  const fields = Object.fromEntries(await request.formData()) as LoginFields
  const result = validationSchema.safeParse(fields)

  if (!result.success) {
    return badRequest<ActionData>({
      fields,
      errors: result.error.flatten(),
    })
  }

  const { email, password, remember, redirectTo } = result.data

  const user = await verifyLogin(email, password)
  if (!user) {
    return badRequest<ActionData>({
      fields: result.data,
      formError: "E-Mail oder Passwort ist falsch",
    })
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on",
    redirectTo,
  })
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

  const isSubmitting = Boolean(transition.submission)

  useEffect(() => {
    if (actionData?.errors?.fieldErrors.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.fieldErrors.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Backpack />
      <div className="h-6"></div>
      <div className="w-full max-w-xs rounded-lg bg-white px-6 py-4 shadow-md sm:max-w-md">
        <Form method="post">
          {actionData?.formError ? (
            <ErrorBadge message={actionData.formError} />
          ) : null}

          <fieldset disabled={isSubmitting} className="space-y-4">
            <div>
              {/* TODO: Refactor to <Input /> component */}
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

            <div>
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

            <div className="flex items-center">
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

            <div className="flex items-center justify-between">
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
                label={isSubmitting ? "Lade..." : "Anmelden"}
              />
            </div>
          </fieldset>
        </Form>
      </div>
      <div className="h-6"></div>
      <Link
        to="/privacy"
        className="text-center text-xs text-slate-500 underline"
      >
        Datenschutzerklärung
      </Link>
    </div>
  )
}
