import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../../../../backend/auth"
import { createBatch } from "../../../../backend/repos"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("gl_token")?.value
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  let auth: any
  try {
    auth = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (auth.role !== "producer") return NextResponse.json({ message: "Forbidden" }, { status: 403 })

  const { batchId, unitsKg, productionDate } = await req.json()
  const valid = /^H2-\d{4}-\d{3}$/.test(batchId)
  if (!valid) return NextResponse.json({ message: "Batch ID must match H2-YYYY-XXX" }, { status: 400 })
  if (!unitsKg || !productionDate) return NextResponse.json({ message: "Missing fields" }, { status: 400 })

  try {
    const doc = await createBatch({
      batchId,
      unitsKg: Number(unitsKg),
      productionDate,
      producerUsername: auth.username,
    })
    return NextResponse.json({ ok: true, doc })
  } catch (e: any) {
    const msg = e?.code === 11000 ? "Batch ID already exists" : "Failed to create batch"
    return NextResponse.json({ message: msg }, { status: 400 })
  }
}
