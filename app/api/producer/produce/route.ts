import { type NextRequest, NextResponse } from "next/server"
import { getDb, col, type Batch } from "@/lib/db"
import { getUserFromCookie } from "@/lib/auth"

function nextIdFormat(year: number, seq: number) {
  const s = String(seq).padStart(3, "0")
  return `H2-${year}-${s}`
}

export async function POST(req: NextRequest) {
  const me = await getUserFromCookie()
  if (!me || me.role !== "producer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { unitsKg, productionDate, batchId } = await req.json()
  if (!unitsKg || !productionDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  await getDb()
  const year = new Date(productionDate).getFullYear()
  let id = batchId as string | undefined
  if (!id) {
    const count = await col<Batch>("batches").countDocuments({ batchId: { $regex: `^H2-${year}-` } })
    id = nextIdFormat(year, count + 1)
  }
  const doc: Batch = {
    batchId: id!,
    unitsKg: Number(unitsKg),
    productionDate,
    producerUsername: me.username,
    status: "available",
    createdAt: new Date(),
  }
  await col<Batch>("batches").insertOne(doc)
  return NextResponse.json({ batch: doc })
}
