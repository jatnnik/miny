export const renderLoginError = (errorCode: string) => {
  const handledErrors = ['auth/user-not-found', 'auth/wrong-password']

  if (handledErrors.includes(errorCode)) {
    return 'E-Mail oder Passwort ist falsch.'
  }

  return `Fehler: ${errorCode}`
}
