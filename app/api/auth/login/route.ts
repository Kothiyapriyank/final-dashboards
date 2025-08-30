import { type NextRequest, NextResponse } from "next/server"
import { authenticateAnyRole, ensureDefaultUsers } from "../../../../backend/repos"
import { issueToken } from "../../../../backend/auth"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ message: "Missing credentials" }, { status: 400 })
  }

  // Seed defaults if collections are empty (for demo UX)
  await ensureDefaultUsers()

  const auth = await authenticateAnyRole(username, password)
  if (!auth) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
  }

  const token = await issueToken({ username: auth.username, role: auth.role })
  const res = NextResponse.json({ role: auth.role })
  res.cookies.set({
    name: "gl_token",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
