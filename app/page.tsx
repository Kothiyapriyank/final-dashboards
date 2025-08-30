"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import H2Background from "../components/h2-background"
import { IconLeaf, IconLightning, IconGlobe, IconShield } from "../components/icons"

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setErr(j?.message || "Login failed")
        return
      }
      const j = (await res.json()) as { role: "producer" | "buyer" | "regulator" }
      router.push(`/${j.role}`)
    } catch (e: any) {
      setErr("Network error. Please try again.")
    }
  }

  return (
    <main className="relative min-h-screen">
      <H2Background />
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 md:grid-cols-2 gap-8 px-4 py-10">
        {/* Left marketing panel */}
        <section className="rounded-2xl bg-emerald-600 p-8 text-white flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center">
                <IconLeaf width={22} height={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Green Ledger</h2>
                <p className="text-sm text-emerald-100 -mt-0.5">Carbon Credit Platform</p>
              </div>
            </div>

            <h3 className="text-pretty text-xl md:text-2xl font-semibold">
              Transparent, blockchain-powered carbon credit trading for a sustainable future
            </h3>

            <ul className="mt-8 space-y-4 text-emerald-50">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-white/15 grid place-items-center">
                  <IconLightning width={14} height={14} />
                </span>
                <div>
                  <div className="font-medium">Producer Portal</div>
                  <p className="text-sm text-emerald-100">
                    Record hydrogen production and generate verified credits instantly
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-white/15 grid place-items-center">
                  <IconGlobe width={14} height={14} />
                </span>
                <div>
                  <div className="font-medium">Buyer Marketplace</div>
                  <p className="text-sm text-emerald-100">Browse and purchase carbon credits from verified producers</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-6 w-6 rounded-full bg-white/15 grid place-items-center">
                  <IconShield width={14} height={14} />
                </span>
                <div>
                  <div className="font-medium">Regulatory Oversight</div>
                  <p className="text-sm text-emerald-100">Full transparency with real-time transaction monitoring</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <HomeStat number="1,234" label="Credits Traded" />
            <HomeStat number="156" label="Producers" />
            <HomeStat number="89" label="Buyers" />
          </div>
        </section>

        {/* Right sign-in card */}
        <section className="flex items-center">
          <form onSubmit={onSubmit} className="w-full rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5">
            <div className="mx-auto mb-6 h-12 w-12 rounded-xl bg-emerald-600/10 grid place-items-center text-emerald-700">
              <IconLeaf width={24} height={24} />
            </div>
            <h3 className="text-center text-xl font-semibold">Welcome Back</h3>
            <p className="text-center text-sm text-muted-foreground mt-1">Sign in to your Green Ledger account</p>

            <label className="mt-6 block text-sm font-medium">Username</label>
            <input
              className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter username (producer, buyer, or regulator)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label className="mt-4 block text-sm font-medium">Password</label>
            <input
              className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Sign In
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account? <span className="text-emerald-700">Sign up</span>
            </p>
          </form>
        </section>
      </div>
    </main>
  )
}

function HomeStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
      <div className="text-lg font-semibold">{number}</div>
      <div className="text-xs text-emerald-100">{label}</div>
    </div>
  )
}
