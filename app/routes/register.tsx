import type { inferSafeParseErrors } from "~/utils"
import {
  Form,
  Link,
  useActionData,
  useTransition,
  useSearchParams,
} from "@remix-run/react"
import type {
  LoaderArgs,
  ActionArgs,
  MetaFunction,
  HeadersFunction,
} from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { z } from "zod"

import { getUserId, createUserSession } from "~/session.server"
import { createUser, getUserByEmail } from "~/models/user.server"
import { badRequest } from "~/utils"

import Input from "~/components/Input"
import Backpack from "~/components/Backpack"
import { SubmitButton } from "~/components/Buttons"
import { ErrorBadge } from "~/components/Badges"

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

const validationSchema = z
  .object({
    firstName: z.string().min(2, "Mind. 2 Zeichen"),
    email: z.string().email("Ungültige E-Mail"),
    password: z.string().min(6, "Passwort muss mind. 6 Zeichen lang sein"),
    confirmPassword: z.string().min(6),
    redirectTo: z.string().default("/"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  })
type RegisterFields = z.infer<typeof validationSchema>
type RegisterFieldsErrors = inferSafeParseErrors<typeof validationSchema>

interface ActionData {
  formError?: string
  errors?: RegisterFieldsErrors
  fields?: RegisterFields
}

export const action = async ({ request }: ActionArgs) => {
  const fields = Object.fromEntries(await request.formData()) as RegisterFields
  const result = validationSchema.safeParse(fields)

  if (!result.success) {
    return badRequest<ActionData>({
      fields,
      errors: result.error.flatten(),
    })
  }

  const { email, password, firstName, redirectTo } = result.data

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return badRequest<ActionData>({
      errors: {
        fieldErrors: {
          email: ["E-Mail wird schon verwendet"],
        },
      },
    })
  }

  const user = await createUser(email, password, firstName)

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: redirectTo,
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
  const actionData = useActionData<typeof action>()
  const transition = useTransition()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Backpack />
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
              validationError={actionData?.errors?.fieldErrors.firstName?.join(
                ", "
              )}
              autoComplete="given-name"
            />

            <div className="mt-4">
              <Input
                type="email"
                name="email"
                label="E-Mail"
                required
                defaultValue={actionData?.fields?.email}
                validationError={actionData?.errors?.fieldErrors.email?.join(
                  ", "
                )}
                autoComplete="email"
              />
              <span className="mt-2 block text-sm italic leading-normal">
                Diese E-Mail Adresse wird verwendet, um dir Bescheid zu sagen,
                wenn sich jemand für einen deiner Termine einträgt.
              </span>
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
                validationError={actionData?.errors?.fieldErrors.password?.join(
                  ", "
                )}
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
                validationError={actionData?.errors?.fieldErrors.confirmPassword?.join(
                  ", "
                )}
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
