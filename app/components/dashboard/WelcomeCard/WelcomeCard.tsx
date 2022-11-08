import { Form, Link, useTransition } from "@remix-run/react"
import { useEffect, useState } from "react"
import copy from "copy-to-clipboard"
import {
  DocumentDuplicateIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"
import { CheckIcon } from "@heroicons/react/20/solid"

import Card from "~/components/shared/Card"
import Button from "~/components/shared/Buttons"
import { headlineClasses } from "~/components/shared/Headline"
import { labelClasses } from "~/components/shared/Input"
import LoadingSpinner from "~/components/shared/LoadingSpinner"

interface WelcomeCardProps {
  username: string
  slug: string
  isFirstLogin: boolean
}

export default function WelcomeCard({
  username,
  isFirstLogin,
  slug,
}: WelcomeCardProps) {
  const [copied, setCopied] = useState(false)

  const userLink = `dienst.vercel.app/u/${slug}`

  useEffect(() => {
    let timeout: any

    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false)
      }, 1000)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [copied])

  function copyUserLink() {
    copy("https://" + userLink)
    setCopied(true)
  }

  return (
    <Card>
      <h2 className={headlineClasses}>Hey {username}!</h2>
      <div className="h-4"></div>

      {isFirstLogin ? (
        <FirstLoginText />
      ) : (
        <div className="space-y-2">
          <label htmlFor="link" className={labelClasses}>
            Dein Link zum Teilen:
          </label>
          <div className="flex items-center gap-2">
            <Link
              to={`u/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-100 py-2 px-4 pl-3.5 text-sm shadow-sm"
            >
              <GlobeAltIcon className="h-4 w-4" />
              {userLink}
            </Link>
            <button
              className="rounded-md border border-slate-300 bg-slate-100 p-2 text-slate-600 shadow-sm"
              onClick={copyUserLink}
            >
              {copied ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <DocumentDuplicateIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}

function FirstLoginText() {
  const transition = useTransition()

  return (
    <div className="space-y-2">
      <p className="flex items-center font-semibold">
        Willkommen bei miny
        <img src="https://emojicdn.elk.sh/👋" alt="" className="ml-1 h-5 w-5" />
      </p>
      <p>
        Hier kannst du ganz einfach deine freien Termine eintragen und sie dann
        per Link teilen. Wenn sich jemand für einen deiner Termine einträgt,
        bekommst du automatisch eine E-Mail.
      </p>
      {/* <p>
        Tipp: In den{" "}
        <Link to="/settings" className="text-amber-800">
          Einstellungen
        </Link>{" "}
        kannst du miny auch mit deinem Kalender verbinden.
      </p> */}
      <p className="flex items-center">
        Viel Spaß!
        <img src="https://emojicdn.elk.sh/🎉" alt="" className="ml-1 h-5 w-5" />
      </p>
      <div className="h-2"></div>
      <Form action="." method="post">
        <Button
          type="submit"
          name="action"
          value="hideWelcomeText"
          variant="icon"
        >
          Ausblenden{transition.state === "submitting" && <LoadingSpinner />}
        </Button>
      </Form>
    </div>
  )
}
