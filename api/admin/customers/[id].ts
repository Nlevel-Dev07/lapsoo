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

const schema = z.object({
  name: z.string().min(2, "Enter a full name").optional(),
  email: z.string().email("Enter a valid email").optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const id = req.query.id as string

  if (req.method === "PATCH") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid customer update" })
      return
    }

    const { name, email, phone, active, newPassword } = parsed.data

    if (email) {
      const existing = await prisma.customer.findUnique({ where: { email } })
      if (existing && existing.id !== id) {
        res.status(409).json({ error: "An account with this email already exists" })
        return
      }
    }

    const data: { name?: string; email?: string; phone?: string; active?: boolean; passwordHash?: string } = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (active !== undefined) data.active = active
    if (newPassword) data.passwordHash = await hashPassword(newPassword)

    const customer = await prisma.customer.update({
      where: { id },
      data,
      select: customerSelect,
    })
    res.status(200).json(customer)
    return
  }

  if (req.method === "DELETE") {
    const session = requireAdmin(req, res)
    if (!session) return

    await prisma.customer.delete({ where: { id } })
    res.status(204).end()
    return
  }

  methodGuard(req, res, ["PATCH", "DELETE"])
})
