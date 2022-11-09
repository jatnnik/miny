import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import Card from "~/components/shared/Card"
import Container from "~/components/shared/Container"

export const meta: MetaFunction = () => {
  return {
    title: "Datenschutzerklärung",
  }
}

export default function Privacy() {
  return (
    <>
      <div className="h-6 sm:h-8"></div>
      <Container>
        <div className="mb-8 flex items-center">
          <Link
            className="flex items-center gap-2 text-sm font-semibold"
            to="/"
          >
            <img src="/backpack.png" className="w-6" alt="" />
            <h1>miny</h1>
          </Link>
        </div>
        <Card>
          <div className="prose-sm prose prose-slate prose-headings:font-serif prose-headings:font-medium">
            <h1 className="text-xl">Datenschutzerklärung</h1>
            <p>
              Im folgenden Text wird über die Art und Weise, wie
              personenbezogene Daten auf dieser Webseite verarbeitet werden und
              Ihre Rechte in Bezug auf die Verarbeitung von diesen Daten
              informiert.
            </p>
            <h3>Verantwortlich</h3>
            <p>
              Jannik Baranczyk
              <br />
              E-Mail:{" "}
              <a href="mailto:my.miny.app@gmail.com" title="E-Mail">
                my.miny.app@gmail.com
              </a>
            </p>

            <h3>Verarbeitung</h3>
            <p>
              Alle Anbieter außerhalb der EU sind durch das{" "}
              <a
                href="https://www.privacyshield.gov/participant?id=a2zt0000000TTIbAAO"
                target="_blank"
                rel="noreferrer"
              >
                EU-US Privacy Shield
              </a>{" "}
              zertifiziert.
            </p>

            <h3>Hosting</h3>
            <p>
              Diese Webseite ist bei Vercel (Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, USA) gehostet. Vercel ist unter dem{" "}
              <a
                href="https://www.privacyshield.gov/participant?id=a2zt0000000TTIbAAO"
                target="_blank"
                rel="noreferrer"
              >
                EU-US Privacy Shield
              </a>{" "}
              zertifiziert und damit verpflichtet, den EU-Datenschutzvorgaben
              nachzukommen.
            </p>

            <h3>Cookies</h3>
            <p>
              Diese Webseite verwendet <i>keine</i> Tracking-Cookies.
            </p>

            <h3>Registrierung</h3>
            <p>
              Für die Registrierung auf dieser Website werden einige
              personenbezogene Daten benötigt (Vorname, E-Mail), die über eine
              Eingabemaske an uns übermittelt werden. Zum Zeitpunkt der
              Registrierung werden zusätzlich folgende Daten erhoben: Zeitpunkt
              der Registrierung Ihre Registrierung ist für das Bereithalten
              bestimmter Inhalte und Leistungen auf dieser Website erforderlich.
            </p>

            <h3>SSL Verschlüsselung</h3>
            <p>
              Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen,
              verwenden wir dem aktuellen Stand der Technik entsprechende
              Verschlüsselungsverfahren (z. B. SSL) über HTTPS.
            </p>

            <h2>Rechte</h2>
            <p>
              Werden personenbezogene Daten von Ihnen verarbeitet stehen Ihnen
              folgende Rechte zu. Sie können von Ihren Rechten Gebrauch machen,
              indem Sie uns kontaktieren.
            </p>
            <h3>Recht auf Auskunft</h3>
            <p>
              Sie haben, gemäß Art. 15 DSGVO, das Recht unentgeltlich Auskunft
              über die zu Ihrer Person gespeicherten personenbezogenen Daten,
              sowie eine Kopie dieser Daten, zu erhalten.
            </p>
            <h3>Recht auf Datenübertragbarkeit</h3>
            <p>
              Sie haben, gemäß Art. 20 DSGVO, das Recht die über Ihre Person
              gespeicherten personenbezogenen Daten in einem strukturierten,
              gängigen und maschinenlesbaren Format zu erhalten oder die
              Übermittlung an einen anderen Verantwortlichen zu verlangen.
            </p>
            <h3>Recht auf Berichtigung</h3>
            <p>
              Sie haben, gemäß Art. 16 DSGVO, das Recht die Berichtigung zu über
              die zu Ihrer Person gespeicherten personenbezogenen unrichtigen
              oder unvollständiger Daten zu verlangen.
            </p>
            <h3>Recht auf Löschung</h3>
            <p>
              Sie haben, gemäß Art. 17 DSGVO, das Recht die Löschung der bei uns
              über Ihre Person gespeicherten personenbezogenen Daten zu
              verlangen, insofern diese nicht nicht zur Erfüllung einer
              rechtlichen Verpflichtung, aus Gründen des öffentlichen Interesses
              oder zur Geltendmachung, Ausübung oder Verteidigung von
              Rechtsansprüchen erforderlich sind.
            </p>
            <h3>Recht auf Widerruf</h3>
            <p>
              Beruht die Verarbeitung Ihrer personenbezogenen Daten auf einer
              erteilten Einwilligung, haben Sie jederzeit das Recht diese
              Einwilligung zu widerrufen.
            </p>
            <h3>Recht auf Einschränkung der Verarbeitung</h3>
            <p>
              Sind die Voraussetzungen gemäß Art. 18 erfüllt, haben Sie das
              Recht die Einschränkung er Verarbeitung der über Ihre Person
              gespeicherten Daten zu verlangen.
            </p>
            <h3>Recht auf Mitteilung an Empfänger</h3>
            <p>
              Sollten Sie die Berichtigung, Löschung oder eine Einschränkung der
              Verarbeitung über Ihre Person gespeicherten personenbezogenen
              Daten nach Art. 16, 17 und 18 respektive verlangen, werden wir
              diese nach Art. 19 DSGVO allen Empfängern, denen wir die
              entsprechenden Daten offengelegt haben, mitteilen.
            </p>
            <h3>Recht auf Widerspruch</h3>
            <p>
              Sie haben das Recht, insofern Ihre personenbezogenen Daten auf
              Grundlage von berechtigten Interessen gemäß Art. 6 Abs. 1 S. 1
              lit. f DSGVO verarbeitet werden und insofern dafür Gründe
              vorlegen, die sich aus Ihrer besonderen Situation ergeben, gemäß
              Art.21 DSGVO Widerspruch gegen die Verarbeitung Ihrer
              personenbezogenen Daten einzulegen.
            </p>
          </div>
        </Card>
      </Container>
      <div className="h-6"></div>
    </>
  )
}
