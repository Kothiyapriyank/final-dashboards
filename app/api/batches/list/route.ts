import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../../../../backend/auth"
import { listBatches } from "../../../../backend/repos"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("gl_token")?.value
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  let auth: any
  try {
    auth = await verifyToken(token)
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const scope = (searchParams.get("scope") || "all") as any

  const items = await listBatches(scope, auth.username, auth.role)
  return NextResponse.json({ items })
}
