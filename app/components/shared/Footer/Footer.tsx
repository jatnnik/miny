import { Link } from "@remix-run/react"
import { version } from "~/config"

export default function Footer() {
  return (
    <div className="text-center text-xs text-slate-500">
      <span>v{version}</span> &middot;{" "}
      <a
        href="https://github.com/wh1zk1d/miny/blob/main/CHANGELOG.md"
        target="_blank"
        rel="noreferrer"
        title="Changelog"
        className="underline underline-offset-1"
      >
        Changelog
      </a>{" "}
      &middot;{" "}
      <Link to="/datenschutz" className="underline underline-offset-1">
        Datenschutzerklärung
      </Link>
    </div>
  )
}
