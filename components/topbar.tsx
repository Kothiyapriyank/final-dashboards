"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { IconLeaf, IconLogout, IconUser } from "./icons"

export default function Topbar({ role }: { role: "producer" | "buyer" | "regulator" }) {
  const router = useRouter()
  const pathname = usePathname()

  const roleStyles =
    role === "producer"
      ? "bg-emerald-600 text-white"
      : role === "buyer"
        ? "bg-blue-600 text-white"
        : "bg-gray-700 text-white"

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600/10 text-emerald-700">
            <IconLeaf width={18} height={18} />
          </span>
          <div className="leading-tight">
            <div className="font-semibold">Green Ledger</div>
            <div className="text-xs text-muted-foreground -mt-0.5">Carbon Credit Platform</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${roleStyles}`}>{role}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600/10 text-emerald-700">
            <IconUser />
          </span>
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" })
              } catch (e) {}
              // always return to home
              router.push("/")
            }}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <IconLogout />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
