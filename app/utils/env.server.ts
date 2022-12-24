import invariant from "tiny-invariant"

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string
      DATABASE_URL: string
      GMAIL_USER: string
      GMAIL_PW: string
    }
  }
}

export function init() {
  const requiredServerEnvs = [
    "NODE_ENV",
    "SESSION_SECRET",
    "DATABASE_URL",
    "GMAIL_USER",
    "GMAIL_PW",
  ] as const

  for (const env of requiredServerEnvs) {
    invariant(process.env[env], `${env} is required`)
  }
}
