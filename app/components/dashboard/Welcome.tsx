import { Link } from "@remix-run/react"
import type { PublicUser } from "~/models/user.server"
import { motion } from "framer-motion"
import Card from "../Card"
import { headingStyles } from "../Heading"
import { useState } from "react"

export default function Welcome({
  user,
  greeting,
}: {
  user: PublicUser
  greeting: string
}) {
  const [open, setOpen] = useState(false)

  const firstLogin = user.loginCount === 0

  return (
    <Card>
      <h1 className={headingStyles}>
        {greeting} {user.name}!
      </h1>
      {firstLogin && (
        <div className="mt-4">
          <h3 className="mb-0.5 font-medium text-amber-800">
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
        <span className="block text-sm font-medium text-amber-800">
          Dein Link zum Teilen:
        </span>
        <Link to={`/u/${user.slug}`} className="underline underline-offset-1">
          https://dienst.vercel.app/u/{user.slug}
        </Link>
      </p>

      <button
        onClick={() => setOpen(!open)}
        className="mt-4 font-medium underline"
      >
        Show {open ? "less" : "more"}
      </button>

      <motion.div
        className="relative mt-4 overflow-hidden rounded-xl bg-neutral-100"
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={{
          type: "spring",
          duration: 0.3,
          bounce: 0.1,
        }}
      >
        <p className="p-4">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Expedita
          cupiditate ipsam neque voluptatibus harum dolorum? Itaque, dicta
          temporibus tempore quo accusamus repellendus id quibusdam quisquam
          nesciunt cumque soluta sed iusto?
        </p>
      </motion.div>
    </Card>
  )
}
