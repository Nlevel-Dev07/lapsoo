import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireAdmin } from "../../_lib/auth"
import { hashPassword } from "../../_lib/customerAuth"

const customerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  _count: { select: { repairRequests: true } },
} as const

const createSchema = z.object({
  name: z.string().min(2, "Enter a full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const session = requireAdmin(req, res)
    if (!session) return

    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      select: customerSelect,
    })
    res.status(200).json(customers)
    return
  }

  if (req.method === "POST") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid customer data" })
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
      data: { name, email, phone, passwordHash, emailVerified: true },
      select: customerSelect,
    })
    res.status(201).json(customer)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
