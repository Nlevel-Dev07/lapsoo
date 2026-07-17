import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { verifyPassword, signCustomerSession, setCustomerSessionCookie } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
  const { email, password } = parsed.data

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

  await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } })

  const token = signCustomerSession({ id: customer.id, email: customer.email, name: customer.name })
  setCustomerSessionCookie(res, token)
  res.status(200).json({ id: customer.id, email: customer.email, name: customer.name })
})
