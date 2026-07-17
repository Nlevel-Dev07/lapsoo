import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import * as cookie from "cookie"
import type { VercelRequest, VercelResponse } from "@vercel/node"

const JWT_SECRET = process.env.JWT_SECRET as string
const COOKIE_NAME = "lapsoo_customer_session"
const SESSION_DAYS = 30

export interface CustomerSession {
  id: string
  email: string
  name: string
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signCustomerSession(payload: CustomerSession) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` })
}

const isProd = process.env.NODE_ENV === "production"

export function setCustomerSessionCookie(res: VercelResponse, token: string) {
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

export function clearCustomerSessionCookie(res: VercelResponse) {
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

export function getCustomerSession(req: VercelRequest): CustomerSession | null {
  const raw = req.headers.cookie
  if (!raw) return null
  const parsed = cookie.parse(raw)
  const token = parsed[COOKIE_NAME]
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerSession
  } catch {
    return null
  }
}

export function requireCustomer(req: VercelRequest, res: VercelResponse): CustomerSession | null {
  const session = getCustomerSession(req)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return null
  }
  return session
}
