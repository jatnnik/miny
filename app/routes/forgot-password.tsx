import type { DataFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Link, useFetcher } from "@remix-run/react"
import invariant from "tiny-invariant"
import bcrypt from "bcryptjs"

import { getUserId } from "~/session.server"
import { prisma } from "~/db.server"

import Input from "~/components/shared/Input"
import Button from "~/components/shared/Buttons"
import { LoginCard, LoginWrapper } from "~/components/login"
import LoadingSpinner from "~/components/shared/LoadingSpinner"
import { getDomainUrl, generateRandomToken } from "~/utils/misc.server"
import { sendEmail } from "~/utils/email.server"
import Toast from "~/components/shared/Toast"

const resetPasswordTokenQueryParam = "token"

export async function loader({ request }: DataFunctionArgs) {
  const userId = await getUserId(request)
  if (userId) return redirect("/")

  // Detect token in URL
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const id = searchParams.get("id")
  if (token) {
    return redirect(`/reset-password?token=${token}&id=${id}`)
  }

  return json({})
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData()
  const { email } = Object.fromEntries(formData)

  invariant(typeof email === "string", "invalid type")
  invariant(email.length < 256, "email too long")

  // Check if a user with this email exists
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
    select: {
      email: true,
      slug: true,
      id: true,
      passwordResetTokens: true,
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

  // Generate the token
  const resetPasswordToken = generateRandomToken()
  const resetPasswordUrl = new URL(`${getDomainUrl(request)}/forgot-password`)
  resetPasswordUrl.searchParams.set(
    resetPasswordTokenQueryParam,
    resetPasswordToken
  )
  resetPasswordUrl.searchParams.append("id", user.id.toString())

  // Prevent spam by allowing max. 3 tries
  if (user.passwordResetTokens.length >= 3) {
    return json({
      status: "error",
      errors: {
        email: null,
        form: "Max. Versuche überschritten. Bitte schicke eine Mail an my.miny.app@gmail.com, um dein Passwort zurückzusetzen.",
      },
    })
  }

  // Hash the token and store it in the DB
  const hashedToken = await bcrypt.hash(resetPasswordToken, 10)
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
    },
  })

  // Send the email
  try {
    await sendEmail({
      to: user.email,
      subject: "miny Passwort zurücksetzen",
      text: `Öffne diesen Link, um dein Passwort zurückzusetzen: ${resetPasswordUrl}`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		    <html>
			    <head>
				    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
			    </head>
			    <body>
				    <p>Klicke auf den Link, um dein Passwort zurückzusetzen. Wenn du das "Passwort vergessen" Formular nicht ausgefüllt hast, kannst du diese E-Mail ignorieren.</p>
				    <a href="${resetPasswordUrl}">${resetPasswordUrl}</a>
			    </body>
        </html>
      `,
    })

    return json({ status: "success", errors: null })
  } catch (error) {
    return json({
      status: "error",
      errors: { email: null, form: "Mail konnte nicht versendet werden." },
    })
  }
}

export default function ForgotPasswordRoute() {
  const forgotPassword = useFetcher<typeof action>()
  const hasError = forgotPassword.data?.errors?.email

  return (
    <LoginWrapper>
      <img src="/backpack.png" className="w-10 sm:w-12" alt="" />
      <div className="h-6"></div>
      <LoginCard>
        <h1 className="font-semibold">Passwort vergessen</h1>
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
        {forgotPassword.data?.errors?.form ? (
          <Toast variant="error" className="mt-4">
            {forgotPassword.data?.errors?.form}
          </Toast>
        ) : null}
        {forgotPassword.data?.status === "success" ? (
          <Toast className="mt-4">
            Super, du solltest jetzt eine Mail bekommen.
          </Toast>
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

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return (
    <div className="p-6">An unexpected error occurred: {error.message}</div>
  )
}
