import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { hashPassword, signCustomerSession, setCustomerSessionCookie } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"
import { verifyCode } from "../_lib/customerVerification"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().length(6, "Enter the 6-digit code"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  if (isRateLimited(req, "customer-reset-password", 10, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many attempts. Please try again shortly." })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" })
    return
  }
  const { email, code, newPassword } = parsed.data

  const customer = await prisma.customer.findUnique({ where: { email } })
  if (!customer) {
    res.status(400).json({ error: "Incorrect code" })
    return
  }

  const result = await verifyCode(customer.id, code, "PASSWORD_RESET")
  if (!result.ok) {
    res.status(400).json({ error: result.error })
    return
  }

  const passwordHash = await hashPassword(newPassword)
  const updated = await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordHash },
  })

  const token = signCustomerSession({ id: updated.id, email: updated.email, name: updated.name })
  setCustomerSessionCookie(res, token)
  res.status(200).json({ id: updated.id, email: updated.email, name: updated.name })
})
