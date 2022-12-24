import nodemailer from "nodemailer"

interface Props {
  to: string
  subject: string
  text: string
  html: string
}

async function sendEmail({ to, subject, text, html }: Props) {
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
