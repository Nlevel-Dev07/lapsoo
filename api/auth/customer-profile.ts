import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { requireCustomer, signCustomerSession, setCustomerSessionCookie } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").optional().or(z.literal("")),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET", "PATCH"])) return

  const session = requireCustomer(req, res)
  if (!session) return

  if (req.method === "GET") {
    const customer = await prisma.customer.findUnique({ where: { id: session.id } })
    if (!customer) {
      res.status(404).json({ error: "Account not found" })
      return
    }
    res.status(200).json({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, createdAt: customer.createdAt })
    return
  }

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid profile data" })
    return
  }
  const { name, phone } = parsed.data

  const customer = await prisma.customer.update({
    where: { id: session.id },
    data: { name, phone: phone || null },
  })

  const token = signCustomerSession({ id: customer.id, email: customer.email, name: customer.name })
  setCustomerSessionCookie(res, token)
  res.status(200).json({ id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, createdAt: customer.createdAt })
})
