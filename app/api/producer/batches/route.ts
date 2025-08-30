import { NextResponse } from "next/server"
import { getDb, col, type Batch } from "@/lib/db"
import { getUserFromCookie } from "@/lib/auth"

export async function GET() {
  const me = await getUserFromCookie()
  if (!me || me.role !== "producer") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await getDb()
  const batches = await col<Batch>("batches").find({ producerUsername: me.username }).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ batches })
}
