"use client"

import H2Background from "../../components/h2-background"
import { Header } from "../../components/header"
import { IconCart, IconCoin, IconExternal } from "../../components/icons"
import { useEffect, useState } from "react"

type Credit = {
  id: string
  producer: string
  units: number
  price?: number
  date: string
  status: "Available" | "Sold"
  batchId?: string
}

const AVAILABLE: Credit[] = [
  {
    id: "CC-2024-001",
    producer: "GreenTech Hydrogen Ltd.",
    units: 250,
    price: 15.5,
    date: "2024-01-15",
    status: "Available",
  },
  {
    id: "CC-2024-002",
    producer: "EcoHydro Solutions",
    units: 180,
    price: 14.25,
    date: "2024-01-20",
    status: "Available",
  },
  {
    id: "CC-2024-003",
    producer: "Renewable Energy Corp",
    units: 420,
    price: 16.75,
    date: "2024-01-18",
    status: "Available",
  },
  {
    id: "CC-2024-004",
    producer: "Clean Power Systems",
    units: 95,
    price: 13.9,
    date: "2024-01-22",
    status: "Available",
  },
]

const HISTORY = [
  {
    id: "CC-2024-001",
    producer: "GreenTech Hydrogen Ltd.",
    units: 100,
    amount: 1550,
    date: "2024-01-25 08:00 PM",
    status: "Completed",
  },
  {
    id: "CC-2024-003",
    producer: "Renewable Energy Corp",
    units: 250,
    amount: 4187.5,
    date: "2024-01-23 02:45 PM",
    status: "Completed",
  },
  {
    id: "CC-2024-002",
    producer: "EcoHydro Solutions",
    units: 75,
    amount: 1068.75,
    date: "2024-01-20 10:15 PM",
    status: "Completed",
  },
  {
    id: "CC-2024-005",
    producer: "Clean Power Systems",
    units: 150,
    amount: 2085.0,
    date: "2024-01-28 04:50 PM",
    status: "Pending",
  },
]

export default function BuyerPage() {
  const [available, setAvailable] = useState<Credit[]>([])
  const totalOwned = 425
  const totalSpend = 6806.25

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch("/api/me", { cache: "no-store" })
        if (!me.ok) throw new Error()
        const j = (await me.json()) as { role: string }
        if (j.role !== "buyer") throw new Error()
      } catch {
        if (active) window.location.href = "/"
        return
      }

      try {
        const res = await fetch("/api/batches/list?scope=available", { cache: "no-store" })
        const j = (await res.json()) as { items: any[] }
        if (!res.ok) return
        const mapped: Credit[] = j.items.map((b) => ({
          id: b.batchId,
          producer: b.producerUsername,
          units: b.unitsKg,
          price: 15 + (b.unitsKg % 5) / 10, // simple demo price
          date: b.productionDate,
          status: "Available",
          batchId: b.batchId,
        }))
        if (active) setAvailable(mapped)
      } catch {}
    })()
    return () => {
      active = false
    }
  }, [])

  async function buy(c: Credit) {
    if (!c.batchId) return
    const res = await fetch("/api/batches/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: c.batchId }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(j?.message || "Failed to buy")
      return
    }
    setAvailable((prev) => prev.filter((x) => x.batchId !== c.batchId))
    alert(`Purchased ${c.units} kg from ${c.producer} (batch ${c.batchId})`)
  }

  return (
    <main className="relative min-h-screen">
      <H2Background />
      <Header role="buyer" />

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Available Credits */}
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-emerald-600/10 grid place-items-center text-emerald-700">
                <IconCoin width={18} height={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Available Carbon Credits</h2>
                <p className="text-sm text-muted-foreground">
                  Browse and purchase carbon credits from verified producers
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 pr-4">Credit ID</th>
                  <th className="py-3 pr-4">Producer</th>
                  <th className="py-3 pr-4">Units</th>
                  <th className="py-3 pr-4">Price/Unit</th>
                  <th className="py-3 pr-4">Total Value</th>
                  <th className="py-3 pr-4">Production Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(available.length ? available : AVAILABLE).map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.id}</td>
                    <td className="py-3 pr-4">{c.producer}</td>
                    <td className="py-3 pr-4">{c.units} kg CO₂e</td>
                    <td className="py-3 pr-4">${(c.price ?? 14.5).toFixed(2)}</td>
                    <td className="py-3 pr-4 font-medium">${((c.units || 0) * (c.price ?? 14.5)).toLocaleString()}</td>
                    <td className="py-3 pr-4">{new Date(c.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => buy(c)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <IconCart width={14} height={14} /> Buy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Purchase History */}
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-blue-600/10 grid place-items-center text-blue-700">
                <IconCart width={18} height={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Purchase History</h2>
                <p className="text-sm text-muted-foreground">Your carbon credit purchase transactions</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total Purchases" value={HISTORY.length.toString()} />
              <Stat label="Credits Owned" value={`${totalOwned} kg CO₂e`} />
              <Stat label="Total Spent" value={`$${totalSpend.toLocaleString()}`} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 pr-4">Credit ID</th>
                  <th className="py-3 pr-4">Producer</th>
                  <th className="py-3 pr-4">Units</th>
                  <th className="py-3 pr-4">Amount Paid</th>
                  <th className="py-3 pr-4">Purchase Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">{t.id}</td>
                    <td className="py-3 pr-4">{t.producer}</td>
                    <td className="py-3 pr-4">{t.units} kg</td>
                    <td className="py-3 pr-4">${t.amount.toLocaleString()}</td>
                    <td className="py-3 pr-4">{t.date}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          t.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <a
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        <IconExternal width={14} height={14} /> View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-2 text-right">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
