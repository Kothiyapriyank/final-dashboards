import { NextResponse } from "next/server"
import { getDb, col, type Batch, type Purchase } from "@/lib/db"
import { getUserFromCookie } from "@/lib/auth"

export async function GET() {
  const me = await getUserFromCookie()
  if (!me || me.role !== "regulator") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await getDb()
  const productions = await col<Batch>("batches").find({}).sort({ createdAt: -1 }).toArray()
  const purchases = await col<Purchase>("purchases").find({}).sort({ purchasedAt: -1 }).toArray()
  const availableCount = productions.filter((p) => p.status === "available").length
  return NextResponse.json({ productions, purchases, availableCount })
}
