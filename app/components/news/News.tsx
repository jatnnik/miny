import Button from "../shared/Buttons"
import Card from "../shared/Card"
import { headlineClasses } from "../shared/Headline"

interface NewsItemProps {
  emoji: string
  title?: string
  text: string
}

function NewsItem({ emoji, title, text }: NewsItemProps) {
  const emojiSrc = `https://emojicdn.elk.sh/${emoji}`

  return (
    <div className="flex items-start gap-3">
      <img src={emojiSrc} alt="" className="h-5 w-5" width={20} height={20} />
      <div>
        {title ? <h4 className="font-semibold">{title}</h4> : null}
        <p className="text-slate-500">{text}</p>
      </div>
    </div>
  )
}

export default function NewsCard() {
  return (
    <Card>
      <h1 className={headlineClasses}>News</h1>
      <div className="h-3"></div>
      <p className="text-sm">
        miny v2.0 ist da und bringt einige neue Funktionen mit!
      </p>
      <div className="h-6"></div>

      <div className="space-y-6 text-sm">
        <NewsItem
          emoji="✨"
          title="Verbessertes Design"
          text="Alles ist jetzt ein bisschen aufgeräumter und übersichtlicher."
        />
        <NewsItem
          emoji="🔄"
          title="Wiederholende Termine"
          text="Über den neuen Kalender können jetzt mehrere Termine auf einmal angelegt werden."
        />
        <NewsItem
          emoji="❌"
          title="Gruppenteilnehmer bearbeiten"
          text="Gruppenteilnehmer können über die &bdquo;Bearbeiten&ldquo; Ansicht entfernt werden."
        />
        <NewsItem
          emoji="📬"
          title="Nachrichten"
          text="Wenn man sich für einen Termin anmeldet, kann man dem/der Dienstpartnerin jetzt eine kurze Nachricht mitschicken."
        />

        <Button>Ausblenden</Button>
      </div>
    </Card>
  )
}
