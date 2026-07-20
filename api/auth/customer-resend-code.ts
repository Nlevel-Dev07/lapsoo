import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"
import { createAndSendVerification } from "../_lib/customerVerification"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  if (isRateLimited(req, "customer-resend-code", 5, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" })
    return
  }

  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email } })
  if (customer && !customer.emailVerified) {
    await createAndSendVerification(customer)
  }

  res.status(200).json({ ok: true })
})
