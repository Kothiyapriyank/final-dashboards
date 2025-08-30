"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import H2Background from "@/components/h2-background"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data?.error || "Login failed")
      return
    }
    router.replace(`/${data.role}`)
  }

  return (
    <main className="min-h-screen relative">
      <H2Background />
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-8 px-4 py-10">
        <div className="hidden md:flex flex-col justify-center rounded-xl bg-green-600 text-white p-10">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20" />
            <div>
              <div className="text-2xl font-semibold">Green Ledger</div>
              <div className="text-white/80 text-sm">Carbon Credit Platform</div>
            </div>
          </div>
          <p className="mt-6 text-pretty leading-relaxed">
            Transparent, blockchain-powered carbon credit trading for a sustainable future.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat label="Credits Traded" value="1,234" />
            <Stat label="Producers" value="156" />
            <Stat label="Buyers" value="89" />
          </div>
        </div>
        <div className="flex items-center">
          <form
            onSubmit={onSubmit}
            className="w-full bg-white/80 backdrop-blur rounded-xl border p-6 shadow-sm mx-auto max-w-md"
          >
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-lg bg-green-600" />
            </div>
            <h1 className="mt-4 text-center text-xl font-semibold">Welcome Back</h1>
            <p className="text-center text-sm text-gray-600">Sign in to your Green Ledger account</p>

            <label className="block mt-6 text-sm font-medium">Username</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="producer, buyer, or regulator"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label className="block mt-4 text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <button
              disabled={loading}
              className="mt-6 w-full rounded-md bg-green-600 text-white py-2.5 font-medium hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Demo users: producer/producer123, buyer/buyer123, regulator/regulator123
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-4 text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-white/80 text-sm">{label}</div>
    </div>
  )
}
