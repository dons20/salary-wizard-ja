import { APP_NAME } from "../../lib/constants"

export function Disclaimer() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-2 text-center text-sm text-slate-600">
      <p className="font-semibold text-slate-800 uppercase">Estimate only</p>
      <p className="mt-2">
        Jamaican tax rules are subject to change. Verify your individual figures with TAJ or a qualified tax
        professional before making any financial decisions.
      </p>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="-mx-4 bg-[radial-gradient(circle_at_top_left,rgba(167,243,208,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(110,231,183,0.12),transparent_28%),linear-gradient(135deg,#082f24_0%,#0b3d2e_42%,#0f5d46_100%)] px-5 py-8 text-center text-sm text-emerald-50/82 sm:-mx-6 sm:px-8 lg:-mx-8 lg:px-10">
      <p>
        Copyright © {new Date().getFullYear()} {APP_NAME}.<br />Made with ❤️ in Jamaica by Keno
      </p>
      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <a
          href="https://github.com/dons20"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-emerald-50 underline decoration-emerald-200/35 underline-offset-4 transition hover:text-emerald-200"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/keno-clayton/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-emerald-50 underline decoration-emerald-200/35 underline-offset-4 transition hover:text-emerald-200"
        >
          LinkedIn
        </a>
      </p>
    </footer>
  )
}