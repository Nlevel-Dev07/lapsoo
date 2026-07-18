import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { requireCustomer, verifyPassword, hashPassword } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  const session = requireCustomer(req, res)
  if (!session) return

  if (isRateLimited(req, "customer-change-password", 10, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many attempts. Please try again shortly." })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid password data" })
    return
  }
  const { currentPassword, newPassword } = parsed.data

  const customer = await prisma.customer.findUnique({ where: { id: session.id } })
  if (!customer) {
    res.status(404).json({ error: "Account not found" })
    return
  }

  const valid = await verifyPassword(currentPassword, customer.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" })
    return
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.customer.update({ where: { id: customer.id }, data: { passwordHash } })
  res.status(200).json({ ok: true })
})
