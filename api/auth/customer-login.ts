import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { prisma } from "../_lib/prisma"
import { verifyPassword, signCustomerSession, setCustomerSessionCookie } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"

const JWT_SECRET = process.env.JWT_SECRET as string

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  captchaToken: z.string().min(1, "Security check expired. Please try again."),
  captchaAnswer: z.coerce.number(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  if (isRateLimited(req, "customer-login", 20, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many login attempts. Please try again shortly." })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials" })
    return
  }
  const { email, password, captchaToken, captchaAnswer } = parsed.data

  try {
    const captcha = jwt.verify(captchaToken, JWT_SECRET) as { purpose: string; a: number; b: number }
    if (captcha.purpose !== "login-captcha" || captcha.a + captcha.b !== captchaAnswer) {
      res.status(400).json({ error: "Incorrect answer to the security check", captchaFailed: true })
      return
    }
  } catch {
    res.status(400).json({ error: "Security check expired. Please try again.", captchaFailed: true })
    return
  }

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer || !customer.active) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }

  const valid = await verifyPassword(password, customer.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }

  if (!customer.emailVerified) {
    res.status(403).json({ error: "Please verify your email before logging in", requiresVerification: true, email: customer.email })
    return
  }

  await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } })

  const token = signCustomerSession({ id: customer.id, email: customer.email, name: customer.name })
  setCustomerSessionCookie(res, token)
  res.status(200).json({ id: customer.id, email: customer.email, name: customer.name })
})
