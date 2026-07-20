import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { hashPassword } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"
import { createAndSendVerification } from "../_lib/customerVerification"

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  if (isRateLimited(req, "customer-signup", 10, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many signup attempts. Please try again shortly." })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid signup data" })
    return
  }
  const { name, email, phone, password } = parsed.data

  const existing = await prisma.customer.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" })
    return
  }

  const passwordHash = await hashPassword(password)
  const customer = await prisma.customer.create({
    data: { name, email, phone, passwordHash },
  })

  await createAndSendVerification(customer)

  res.status(201).json({ id: customer.id, email: customer.email, name: customer.name, requiresVerification: true })
})
