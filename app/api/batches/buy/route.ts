import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../../../../backend/auth"
import { buyBatch } from "../../../../backend/repos"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("gl_token")?.value
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  let auth: any
  try {
    auth = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (auth.role !== "buyer") return NextResponse.json({ message: "Forbidden" }, { status: 403 })

  const { batchId } = await req.json()
  if (!batchId) return NextResponse.json({ message: "Missing batchId" }, { status: 400 })

  const updated = await buyBatch(batchId, auth.username)
  if (!updated) return NextResponse.json({ message: "Batch not available or not found" }, { status: 400 })

  return NextResponse.json({ ok: true, updated })
}
