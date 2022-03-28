import { Link } from 'remix'
import type { User } from '~/models/user.server'
import Card from '../Card'

function useGreeting() {
  const currentHour = new Date().getHours()
  let greeting = 'Hey'

  if (currentHour < 11 && currentHour > 4) {
    greeting = 'Guten Morgen'
  } else if (currentHour > 18) {
    greeting = 'Guten Abend'
  }

  return greeting
}

export default function Welcome({ user, link }: { user: User; link: string }) {
  const greeting = useGreeting()
  const firstLogin = user.loginCount === 0

  return (
    <Card>
      <div className="flex items-center">
        <h1 className="mr-2 font-serif text-2xl font-black text-slate-700">
          {greeting} {user.name}!
        </h1>
      </div>
      {firstLogin && (
        <div className="mt-4">
          <h3 className="mb-0.5 font-medium text-slate-800">
            Willkommen bei miny!
          </h3>
          <p>
            Hier kannst du ganz einfach deine freien Termine anlegen und sie
            dann per Link an alle schicken, mit denen du dich gerne verabreden
            möchtest. Du wirst automatisch per E-Mail benachrichtigt, wenn sich
            jemand für einen deiner Termine einträgt.
          </p>
        </div>
      )}
      <p className="mt-3">
        Dein Link zum Teilen deiner Termine:{' '}
        <Link to={`/u/${user.slug}`} className="underline">
          {link}
        </Link>
      </p>
    </Card>
  )
}
