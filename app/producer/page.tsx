"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import H2Background from "../../components/h2-background"
import { Header } from "../../components/header"
import { IconChart } from "../../components/icons"

export default function ProducerPage() {
  const router = useRouter()
  const [batchId, setBatchId] = useState("")
  const [units, setUnits] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" })
        if (!res.ok) throw new Error("unauth")
        const j = (await res.json()) as { role: "producer" | "buyer" | "regulator" }
        if (j.role !== "producer" && active) router.replace("/")
      } catch {
        if (active) router.replace("/")
      }
    })()
    return () => {
      active = false
    }
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!batchId || !units || !date) return
    if (!/^H2-\d{4}-\d{3}$/.test(batchId)) {
      alert("Batch ID must match H2-YYYY-XXX (e.g., H2-2024-001)")
      return
    }
    const res = await fetch("/api/batches/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId, unitsKg: Number(units), productionDate: date }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(j?.message || "Failed to submit")
      return
    }
    alert(`Submitted production: ${j.doc.batchId} (${j.doc.unitsKg} kg)`)
    setBatchId("")
    setUnits("")
    setDate("")
  }

  return (
    <main className="relative min-h-screen">
      <H2Background />
      <Header role="producer" />

      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-emerald-600/10 grid place-items-center text-emerald-700">
                <IconChart width={18} height={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Record Hydrogen Production</h2>
                <p className="text-sm text-muted-foreground">
                  Submit your hydrogen production data to generate carbon credits
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium">Hydrogen Batch ID *</label>
              <input
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="e.g., H2-2024-001"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Units Produced (kg) *</label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="Enter production quantity"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Production Date *</label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-600"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
            >
              Submit Production
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
