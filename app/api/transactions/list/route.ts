import { NextResponse } from "next/server"
import { verifyToken } from "../../../../backend/auth"
import { listTransactions } from "../../../../backend/repos"

export async function GET(req: Request) {
  const token = (req as any).cookies?.get?.("gl_token")?.value || ""
  // Fallback for Next.js: read cookie from request headers
  const cookieHeader = (req as any).headers?.get?.("cookie") as string | undefined
  const tokenFromHeader = cookieHeader
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("gl_token="))
    ?.split("=")[1]
  const t = token || tokenFromHeader

  if (!t) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  let auth: any
  try {
    auth = await verifyToken(t)
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (auth.role !== "regulator") return NextResponse.json({ message: "Forbidden" }, { status: 403 })

  const items = await listTransactions()
  return NextResponse.json({ items })
}
