import type { DataFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Link, useFetcher } from "@remix-run/react"
import invariant from "tiny-invariant"
import { getUserId } from "~/session.server"
import { prisma } from "~/db.server"
import { encrypt } from "~/utils/encryption.server"

import Input from "~/components/shared/Input"
import Button from "~/components/shared/Buttons"
import { LoginCard, LoginWrapper } from "~/components/login"
import LoadingSpinner from "~/components/shared/LoadingSpinner"
import { getDomainUrl } from "~/utils/misc.server"

const resetPasswordTokenQueryParam = "token"
const tokenType = "forgot-password"

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request)
  if (userId) return redirect("/")

  // TODO: Detect token in URL, then validate and redirect
  // https://github.com/epicweb-dev/rocket-rental/blob/main/app/routes/forgot-password.tsx

  return json({})
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData()
  const { email } = Object.fromEntries(formData)

  invariant(typeof email === "string", "invalid type")
  invariant(email.length < 256, "email too long")

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      email: true,
      slug: true,
    },
  })
  if (!user) {
    return json(
      {
        status: "error",
        errors: {
          email: "Benutzer nicht gefunden",
          form: null,
        },
      },
      { status: 400 }
    )
  }

  const resetPasswordToken = encrypt(
    JSON.stringify({
      type: tokenType,
      payload: {
        username: user.slug,
      },
    })
  )
  const resetPasswordUrl = new URL(`${getDomainUrl(request)}/forgot-password`)
  resetPasswordUrl.searchParams.set(
    resetPasswordTokenQueryParam,
    resetPasswordToken
  )

  // TODO: Send email with the link

  return json({ status: "success", errors: null })
}

export default function ForgotPasswordRoute() {
  const forgotPassword = useFetcher<typeof action>()
  const hasError = forgotPassword.data?.errors?.email

  return (
    <LoginWrapper>
      <img src="/backpack.png" className="w-10 sm:w-12" alt="" />
      <div className="h-6"></div>
      <LoginCard>
        <h1 className="font-semibold text-slate-800">Passwort vergessen</h1>
        <p className="mt-1 mb-4 text-slate-600">
          Gib deine E-Mail ein. Du bekommst dann eine Mail mit einem Link, über
          den du dein Passwort zurücksetzen kannst.
        </p>
        <forgotPassword.Form method="post">
          <Input
            type="email"
            name="email"
            label="E-Mail"
            validationError={
              hasError ? forgotPassword.data?.errors?.email : null
            }
            required
            autoFocus={true}
          />
          <div className="h-2"></div>
          <Button
            type="submit"
            intent="submit"
            size="small"
            variant="icon"
            disabled={forgotPassword.state !== "idle"}
          >
            Senden {forgotPassword.state !== "idle" ? <LoadingSpinner /> : null}
          </Button>
        </forgotPassword.Form>
        {forgotPassword.data?.status === "success" ? (
          <div className="mt-4">
            Super, du solltest jetzt eine Mail bekommen.
          </div>
        ) : null}
        <div className="h-4"></div>
        <Link
          to="/login"
          className="text-sm text-slate-600 underline hover:text-slate-900"
        >
          Zurück
        </Link>
      </LoginCard>
    </LoginWrapper>
  )
}
