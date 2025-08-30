import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout", "/api/me"]

const roleToPath: Record<string, string> = {
  producer: "/producer",
  buyer: "/buyer",
  regulator: "/regulator",
}

async function getPayload(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me")
    const { payload } = await jwtVerify(token, secret)
    return payload as { username: string; role: "producer" | "buyer" | "regulator" }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  const payload = await getPayload(req)

  // Root: send to login if not authed, else to their dashboard
  if (pathname === "/") {
    if (!payload) {
      return NextResponse.rewrite(new URL("/login", req.url))
    } else {
      return NextResponse.redirect(new URL(roleToPath[payload.role], req.url))
    }
  }

  // Public paths allowed
  if (isPublic) {
    // If trying to access /login while authed, redirect to dashboard
    if (pathname === "/login" && payload) {
      return NextResponse.redirect(new URL(roleToPath[payload.role], req.url))
    }
    return NextResponse.next()
  }

  // Protect role pages
  const needsRole =
    pathname.startsWith("/producer") || pathname.startsWith("/buyer") || pathname.startsWith("/regulator")
  if (needsRole) {
    if (!payload) return NextResponse.redirect(new URL("/login", req.url))
    if (pathname.startsWith("/producer") && payload.role !== "producer")
      return NextResponse.redirect(new URL("/login", req.url))
    if (pathname.startsWith("/buyer") && payload.role !== "buyer")
      return NextResponse.redirect(new URL("/login", req.url))
    if (pathname.startsWith("/regulator") && payload.role !== "regulator")
      return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
}
