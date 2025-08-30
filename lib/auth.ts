import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import type { Role } from "./db"

const COOKIE_NAME = "token"

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_change_me")
}

export async function createToken(payload: { username: string; role: Role }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as { username: string; role: Role; iat: number; exp: number }
}

export async function getUserFromCookie() {
  const c = cookies().get(COOKIE_NAME)?.value
  if (!c) return null
  try {
    return await verifyToken(c)
  } catch {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
  })
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 })
}
