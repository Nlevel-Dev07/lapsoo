import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import * as cookie from "cookie"
import type { VercelRequest, VercelResponse } from "@vercel/node"

const JWT_SECRET = process.env.JWT_SECRET as string
const COOKIE_NAME = "lapsoo_admin_session"
const SESSION_DAYS = 7

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signSession(payload: AdminSession) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` })
}

// vercel.json proxies /api/* to Railway server-side, so the browser only ever talks
// to the Vercel origin — the cookie is same-site there, no need for SameSite=None.
const isProd = process.env.NODE_ENV === "production"

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DAYS * 24 * 60 * 60,
    })
  )
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(COOKIE_NAME, "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  )
}

export function getSession(req: VercelRequest): AdminSession | null {
  const raw = req.headers.cookie
  if (!raw) return null
  const parsed = cookie.parse(raw)
  const token = parsed[COOKIE_NAME]
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): AdminSession | null {
  const session = getSession(req)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return null
  }
  return session
}
