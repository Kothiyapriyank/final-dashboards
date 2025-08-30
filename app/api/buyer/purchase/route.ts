import { type NextRequest, NextResponse } from "next/server"
import { getDb, col, type Batch, type Purchase } from "@/lib/db"
import { getUserFromCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const me = await getUserFromCookie()
  if (!me || me.role !== "buyer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { batchId } = await req.json()
  if (!batchId) return NextResponse.json({ error: "Missing batchId" }, { status: 400 })
  await getDb()

  const batch = await col<Batch>("batches").findOne({ batchId })
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 })
  if (batch.status !== "available") return NextResponse.json({ error: "Not available" }, { status: 400 })

  await col<Batch>("batches").updateOne({ batchId }, { $set: { status: "sold" } })
  const purchase: Purchase = {
    batchId,
    buyerUsername: me.username,
    purchasedAt: new Date(),
    amountUsd: undefined,
  }
  await col<Purchase>("purchases").insertOne(purchase)
  return NextResponse.json({ ok: true })
}
