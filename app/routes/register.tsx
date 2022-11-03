import type { inferSafeParseErrors } from "~/utils"
import {
  Form,
  Link,
  useActionData,
  useTransition,
  useSearchParams,
} from "@remix-run/react"
import type { LoaderArgs, ActionArgs } from "@remix-run/node"
import { redirect, json } from "@remix-run/node"
import { z } from "zod"
import { safeRedirect } from "~/utils"

import { getUserId, createUserSession } from "~/session.server"
import { createUser, getUserByEmail } from "~/models/user.server"
import { badRequest } from "~/utils"

import Input from "~/components/Input"
import Button from "~/components/shared/Buttons"
import { loginCardClasses, loginWrapperClasses } from "~/components/login"
import LoadingSpinner from "~/components/shared/LoadingSpinner"

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
  errors?: RegisterFieldsErrors
  fields?: RegisterFields
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const fields = Object.fromEntries(formData.entries()) as RegisterFields
  const result = validationSchema.safeParse(fields)

  if (!result.success) {
    return badRequest<ActionData>({
      fields,
      errors: result.error.flatten(),
    })
  }

  const { email, password, firstName } = result.data
  const redirectTo = safeRedirect(result.data.redirectTo, "/")

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
    redirectTo,
  })
}

export default function Register() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? ""
  const actionData = useActionData<typeof action>()

  const transition = useTransition()
  const isBusy = transition.state === "submitting"

  return (
    <div className={loginWrapperClasses}>
      <img src="/backpack.png" className="w-10 sm:w-12" alt="" />
      <div className="h-6"></div>
      <div className={loginCardClasses}>
        <Form method="post">
          <fieldset disabled={isBusy} className="space-y-4">
            <div>
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
            </div>

            <div>
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
            </div>

            <div>
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

            <div>
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

            <div className="flex items-center">
              <input
                id="agreeGdpr"
                name="agreeGdpr"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-200 focus:ring-opacity-50"
                required
              />
              <label htmlFor="agreeGdpr" className="ml-2 block text-sm">
                Ich stimme der{" "}
                <Link
                  to="/datenschutz"
                  className="underline underline-offset-1 hover:no-underline"
                >
                  Datenschutzerklärung
                </Link>{" "}
                zu
              </label>
            </div>

            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Link
                  className="block text-sm text-slate-600 underline hover:text-slate-900"
                  to={{
                    pathname: "/login",
                    search: searchParams.toString(),
                  }}
                >
                  Login
                </Link>
              </div>

              <Button type="submit" intent="submit" size="small" variant="icon">
                Registrieren {isBusy && <LoadingSpinner />}
              </Button>
            </div>
          </fieldset>
        </Form>
      </div>
      <div className="h-6"></div>
      <Link
        to="/datenschutz"
        className="text-center text-xs text-slate-600 underline"
      >
        Datenschutzerklärung
      </Link>
    </div>
  )
}
