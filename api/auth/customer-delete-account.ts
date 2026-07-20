import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { requireCustomer, verifyPassword, clearCustomerSessionCookie } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"

const schema = z.object({
  password: z.string().min(1, "Enter your password to confirm"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["DELETE"])) return

  const session = requireCustomer(req, res)
  if (!session) return

  if (isRateLimited(req, "customer-delete-account", 10, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many attempts. Please try again shortly." })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" })
    return
  }

  const customer = await prisma.customer.findUnique({ where: { id: session.id } })
  if (!customer) {
    res.status(404).json({ error: "Account not found" })
    return
  }

  const valid = await verifyPassword(parsed.data.password, customer.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "Incorrect password" })
    return
  }

  await prisma.customer.delete({ where: { id: customer.id } })
  clearCustomerSessionCookie(res)
  res.status(200).json({ ok: true })
})
