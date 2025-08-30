"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { IconLeaf } from "./icons"

export function Header({ role }: { role?: "producer" | "buyer" | "regulator" }) {
  const pathname = usePathname()
  const router = useRouter()
  const title =
    role === "producer"
      ? "Producer Dashboard"
      : role === "buyer"
        ? "Buyer Dashboard"
        : role === "regulator"
          ? "Regulator Dashboard"
          : "Green Ledger"

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 grid place-items-center text-white">
            <IconLeaf width={18} height={18} />
          </div>
          <div>
            <div className="font-semibold">Green Ledger</div>
            <div className="text-xs text-muted-foreground -mt-0.5">Carbon Credit Platform</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link
            className={`hover:text-emerald-700 ${pathname === "/" ? "text-emerald-700" : "text-muted-foreground"}`}
            href="/"
          >
            Home
          </Link>
          <Link
            className={`hover:text-emerald-700 ${pathname.startsWith("/producer") ? "text-emerald-700" : "text-muted-foreground"}`}
            href="/producer"
          >
            Producer
          </Link>
          <Link
            className={`hover:text-emerald-700 ${pathname.startsWith("/buyer") ? "text-emerald-700" : "text-muted-foreground"}`}
            href="/buyer"
          >
            Buyer
          </Link>
          <Link
            className={`hover:text-emerald-700 ${pathname.startsWith("/regulator") ? "text-emerald-700" : "text-muted-foreground"}`}
            href="/regulator"
          >
            Regulator
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {role && (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  role === "producer" ? "bg-emerald-600" : role === "buyer" ? "bg-blue-600" : "bg-teal-600"
                }`}
              />
              <span className="capitalize">{role}</span>
            </span>
          )}
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" })
              } catch {}
              router.push("/")
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-6 pt-4">
        <h1 className="text-2xl font-semibold text-balance">{title}</h1>
        {role && <p className="text-sm text-muted-foreground mt-1">Welcome to your {role} dashboard</p>}
      </div>
    </header>
  )
}
