import type { DataFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react"
import { json } from "react-router"
import bcrypt from "bcryptjs"
import { differenceInMinutes } from "date-fns"
import { z } from "zod"
import { prisma } from "~/utils/db.server"
import { getUserId } from "~/utils/session.server"

import { LoginCard, LoginWrapper } from "~/components/login"
import Button from "~/components/shared/Buttons"
import Input from "~/components/shared/Input"
import LoadingSpinner from "~/components/shared/LoadingSpinner"
import type { inferSafeParseErrors } from "~/utils/validation.server"
import invariant from "tiny-invariant"
import { resetUserPassword } from "~/models/user.server"

const EXPIRATION_TIME = 30

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request)
  if (userId) return redirect("/")

  // Check if token exists
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const id = Number(searchParams.get("id"))
  if (!token || !id) return redirect("/login")

  // Get the most recent token for the user
  const lastUserToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      user: {
        select: {
          email: true,
        },
      },
      token: true,
      createdAt: true,
    },
  })
  if (!lastUserToken) {
    return redirect("/login")
  }

  // Validate the token and check if its expired
  const isValid = await bcrypt.compare(token, lastUserToken.token)
  if (!isValid) {
    throw new Error("Invalid token")
  }

  const isExpired =
    differenceInMinutes(new Date(), new Date(lastUserToken.createdAt)) >=
    EXPIRATION_TIME
  if (isExpired) {
    throw new Error("Expired token")
  }

  return json({ user: lastUserToken.user.email, formError: null })
}

const Password = z.string().min(6, "Passwort muss mind. 6 Zeichen lang sein")
const schema = z.object({
  password: Password,
  confirmPassword: Password,
})

type FieldErrors = inferSafeParseErrors<typeof schema>
interface ActionData {
  errors?: FieldErrors
  formError?: string
}

export async function action({ request }: DataFunctionArgs) {
  const userId = Number(new URL(request.url).searchParams.get("id"))

  invariant(userId, "Missing userId")

  const formData = Object.fromEntries(await request.formData())

  // Validate passwords
  const result = schema.safeParse(formData)
  if (!result.success) {
    return json<ActionData>(
      {
        errors: result.error.flatten(),
      },
      { status: 400 }
    )
  }

  // Check if passwords are the same
  const { password, confirmPassword } = result.data
  if (password !== confirmPassword) {
    return json<ActionData>(
      {
        formError: "Passwörter stimmen nicht überein",
      },
      { status: 400 }
    )
  }

  await resetUserPassword({ userId, password })

  return redirect("/login?event=password-resetted")
}

export default function ResetPasswordRoute() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<ActionData>()
  const transition = useTransition()

  const hasPasswordError = actionData?.errors?.fieldErrors.password
  const hasConfirmPasswordError =
    actionData?.errors?.fieldErrors.confirmPassword
  const hasFormError = actionData?.formError

  return (
    <LoginWrapper>
      <img src="/backpack.png" className="w-10 sm:w-12" alt="" />
      <div className="h-6"></div>
      <LoginCard>
        <h1 className="font-semibold">Passwort zurücksetzen</h1>
        {data.user ? (
          <p className="mt-1 text-slate-600">Deine E-Mail: {data.user}</p>
        ) : null}
        <div className="h-4"></div>
        <Form method="post" className="space-y-4">
          <div>
            <Input
              type="password"
              name="password"
              label="Neues Passwort"
              validationError={
                hasPasswordError ? hasPasswordError[0] : undefined
              }
              required
            />
          </div>
          <div>
            <Input
              type="password"
              name="confirmPassword"
              label="Neues Passwort bestätigen"
              validationError={
                hasConfirmPasswordError ? hasConfirmPasswordError[0] : undefined
              }
              required
            />
          </div>
          <Button
            type="submit"
            intent="submit"
            size="small"
            variant="icon"
            disabled={Boolean(transition.submission)}
          >
            Speichern {transition.submission ? <LoadingSpinner /> : null}
          </Button>
        </Form>
        {hasFormError ? (
          <div
            className="mt-4 text-sm font-medium text-rose-500"
            id="form-error"
          >
            {hasFormError}
          </div>
        ) : null}
      </LoginCard>
    </LoginWrapper>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return (
    <div className="p-6">
      <p className="mb-2 font-semibold">Error: {error.message}</p>
      <a href="/login" className="text-sm underline">
        &larr; Zurück zum Login
      </a>
    </div>
  )
}
