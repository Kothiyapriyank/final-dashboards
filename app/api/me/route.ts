import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifyToken } from "../../../backend/auth"

export async function GET() {
  const token = (await cookies()).get("gl_token")?.value
  if (!token) return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  try {
    const payload = await verifyToken(token)
    return NextResponse.json({ username: payload.username, role: payload.role })
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}
