export function useGreeting() {
  const currentHour = new Date().getHours()
  let greeting = 'Hey'

  if (currentHour < 11) {
    greeting = 'Guten Morgen'
  } else if (currentHour > 18) {
    greeting = 'Guten Abend'
  }

  return greeting
}
