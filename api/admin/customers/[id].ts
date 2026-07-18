import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireAdmin } from "../../_lib/auth"
import { hashPassword } from "../../_lib/customerAuth"

const schema = z.object({
  active: z.boolean().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["PATCH"])) return
  const session = requireAdmin(req, res)
  if (!session) return

  const id = req.query.id as string
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid customer update" })
    return
  }

  const { active, newPassword } = parsed.data
  const data: { active?: boolean; passwordHash?: string } = {}
  if (active !== undefined) data.active = active
  if (newPassword) data.passwordHash = await hashPassword(newPassword)

  const customer = await prisma.customer.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { repairRequests: true } },
    },
  })
  res.status(200).json(customer)
})
