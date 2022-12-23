import nodemailer from "nodemailer"
import invariant from "tiny-invariant"

interface Props {
  to: string
  subject: string
  text: string
  html: string
}

async function sendEmail({ to, subject, text, html }: Props) {
  // TODO: Refactor into global env checker
  invariant(process.env.GMAIL_USER, "GMAIL_USER must be set")
  invariant(process.env.GMAIL_PW, "GMAIL_PW must be set")

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PW,
    },
  })

  await transporter.sendMail({
    from: '"miny" <my.miny.app@gmail.com>',
    to,
    subject,
    text,
    html,
  })
}

export { sendEmail }
