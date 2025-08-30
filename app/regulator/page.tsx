"use client"

import H2Background from "../../components/h2-background"
import { Header } from "../../components/header"
import { IconClipboard, IconRetire, IconExternal } from "../../components/icons"
import { useEffect, useState } from "react"

const TRANSACTIONS = [
  {
    type: "Production",
    producer: "Clean Power Systems",
    buyer: "-",
    credit: "CC-2024-004",
    units: 95,
    date: "Jan 28, 2024, 04:00 PM",
    status: "Pending",
  },
  {
    type: "Purchase",
    producer: "GreenTech Hydrogen Ltd.",
    buyer: "EcoTech Solutions Inc.",
    credit: "CC-2024-001",
    units: 100,
    date: "Jan 25, 2024, 10:15 PM",
    status: "Completed",
  },
  {
    type: "Production",
    producer: "GreenTech Hydrogen Ltd.",
    buyer: "-",
    credit: "CC-2024-006",
    units: 250,
    date: "Jan 25, 2024, 08:00 PM",
    status: "Completed",
  },
  {
    type: "Purchase",
    producer: "Renewable Energy Corp",
    buyer: "Green Manufacturing Co.",
    credit: "CC-2024-008",
    units: 260,
    date: "Jan 24, 2024, 04:50 PM",
    status: "Completed",
  },
  {
    type: "Production",
    producer: "Renewable Energy Corp",
    buyer: "-",
    credit: "CC-2024-003",
    units: 420,
    date: "Jan 23, 2024, 02:45 PM",
    status: "Completed",
  },
  {
    type: "Retirement",
    producer: "EcoHydro Solutions",
    buyer: "Carbon Neutral Corp",
    credit: "CC-2024-002",
    units: 180,
    date: "Jan 22, 2024, 06:40 PM",
    status: "Completed",
  },
]

const RETIRED = [
  {
    id: "CC-2024-002",
    originalProducer: "EcoHydro Solutions",
    retiredBy: "Carbon Neutral Corp",
    units: 180,
    retired: "Jan 22, 2024, 06:40 PM",
    reason: "Voluntary carbon offsetting",
  },
  {
    id: "CC-2024-001",
    originalProducer: "GreenTech Hydrogen Ltd.",
    retiredBy: "Sustainable Corp Inc.",
    units: 150,
    retired: "Jan 26, 2024, 04:00 PM",
    reason: "Compliance requirement",
  },
  {
    id: "CC-2024-003",
    originalProducer: "Renewable Energy Corp",
    retiredBy: "Green Manufacturing Co",
    units: 420,
    retired: "Jan 24, 2024, 09:15 PM",
    reason: "Product carbon neutrality",
  },
]

export default function RegulatorPage() {
  const [rows, setRows] = useState(TRANSACTIONS)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const me = await fetch("/api/me", { cache: "no-store" })
        if (!me.ok) throw new Error()
        const j = (await me.json()) as { role: string }
        if (j.role !== "regulator") throw new Error()
      } catch {
        if (active) window.location.href = "/"
        return
      }
      try {
        const res = await fetch("/api/transactions/list", { cache: "no-store" })
        const j = (await res.json()) as { items: any[] }
        if (!res.ok) return
        const mapped = j.items.map((t) => ({
          type: t.type === "production" ? "Production" : "Purchase",
          producer: t.producerUsername,
          buyer: t.buyerUsername || "-",
          credit: t.batchId,
          units: t.unitsKg,
          date: new Date(t.timestamp).toLocaleString(),
          status: "Completed",
        }))
        if (active) setRows(mapped)
      } catch {}
    })()
    return () => {
      active = false
    }
  }, [])

  const total = rows.length
  const completed = rows.filter((t) => t.status === "Completed").length
  const successRate = Math.round((completed / Math.max(1, total)) * 100)

  const retiredTotal = RETIRED.reduce((a, r) => a + r.units, 0)
  const retirementEvents = RETIRED.length
  const activeRetirers = new Set(RETIRED.map((r) => r.retiredBy)).size

  return (
    <main className="relative min-h-screen">
      <H2Background />
      <Header role="regulator" />

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* All Transactions */}
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-emerald-600/10 grid place-items-center text-emerald-700">
                <IconClipboard width={18} height={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">All Transactions</h2>
                <p className="text-sm text-muted-foreground">Monitor all carbon credit transactions on the platform</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total Transactions" value={`${total}`} hint={`${completed} completed`} />
              <Stat label="Total Volume" value={`${rows.reduce((a, t) => a + t.units, 0)} kg CO₂e`} />
              <Stat label="Success Rate" value={`${successRate}%`} />
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <input
              className="w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Search by producer, buyer, credit ID, or transaction hash..."
            />
            <select className="rounded-xl border bg-white px-3 py-2 text-sm">
              <option>All Types</option>
              <option>Production</option>
              <option>Purchase</option>
              <option>Retirement</option>
            </select>
            <select className="rounded-xl border bg-white px-3 py-2 text-sm">
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Producer</th>
                  <th className="py-3 pr-4">Buyer</th>
                  <th className="py-3 pr-4">Credit ID</th>
                  <th className="py-3 pr-4">Units</th>
                  <th className="py-3 pr-4">Date/Time</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          t.type === "Production"
                            ? "bg-emerald-100 text-emerald-700"
                            : t.type === "Purchase"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{t.producer}</td>
                    <td className="py-3 pr-4">{t.buyer}</td>
                    <td className="py-3 pr-4 font-medium">{t.credit}</td>
                    <td className="py-3 pr-4">{t.units} kg</td>
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

        {/* Retired Credits */}
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-teal-600/10 grid place-items-center text-teal-700">
                <IconRetire width={18} height={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Retired Credits</h2>
                <p className="text-sm text-muted-foreground">Track carbon credits that have been permanently retired</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total Retired" value={`${retiredTotal} kg CO₂e`} hint="permanently retired" />
              <Stat label="Retirement Events" value={`${retirementEvents}`} />
              <Stat label="Active Retirers" value={`${activeRetirers}`} />
            </div>
          </div>

          <div className="mb-4">
            <input
              className="w-full rounded-xl border bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder="Search by credit ID, producer, retirer, or transaction hash..."
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 pr-4">Credit ID</th>
                  <th className="py-3 pr-4">Original Producer</th>
                  <th className="py-3 pr-4">Retired By</th>
                  <th className="py-3 pr-4">Units Retired</th>
                  <th className="py-3 pr-4">Retirement Date</th>
                  <th className="py-3 pr-4">Reason</th>
                  <th className="py-3">Documents</th>
                </tr>
              </thead>
              <tbody>
                {RETIRED.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.id}</td>
                    <td className="py-3 pr-4">{r.originalProducer}</td>
                    <td className="py-3 pr-4">{r.retiredBy}</td>
                    <td className="py-3 pr-4">{r.units} kg CO₂e</td>
                    <td className="py-3 pr-4">{r.retired}</td>
                    <td className="py-3 pr-4">{r.reason}</td>
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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-2 text-right">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  )
}
