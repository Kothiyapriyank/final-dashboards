import { NextResponse } from "next/server"
import { getDb, col, type Purchase, type Batch } from "@/lib/db"
import { getUserFromCookie } from "@/lib/auth"

export async function GET() {
  const me = await getUserFromCookie()
  if (!me || me.role !== "buyer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await getDb()
  const purchases = await col<Purchase>("purchases")
    .find({ buyerUsername: me.username })
    .sort({ purchasedAt: -1 })
    .toArray()

  // join units
  const batches = await col<Batch>("batches")
    .find({ batchId: { $in: purchases.map((p) => p.batchId) } })
    .toArray()
  const unitsMap = new Map(batches.map((b) => [b.batchId, b.unitsKg]))
  const withUnits = purchases.map((p) => ({ ...p, unitsKg: unitsMap.get(p.batchId) }))
  return NextResponse.json({ purchases: withUnits })
}
