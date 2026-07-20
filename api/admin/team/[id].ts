import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireMenu, hashPassword } from "../../_lib/auth"

const teamMemberSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  designation: true,
  store: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  role: { select: { id: true, name: true, menuKeys: true } },
} as const

const schema = z.object({
  name: z.string().min(2, "Enter a full name").optional(),
  email: z.string().email("Enter a valid email").optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  store: z.string().optional(),
  roleId: z.string().nullable().optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const session = requireMenu(req, res, "teams")
  if (!session) return

  const id = req.query.id as string

  if (req.method === "PATCH") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid team member update" })
      return
    }
    const { newPassword, ...rest } = parsed.data

    if (rest.email) {
      const existing = await prisma.teamMember.findUnique({ where: { email: rest.email } })
      if (existing && existing.id !== id) {
        res.status(409).json({ error: "A team member with this email already exists" })
        return
      }
    }

    const data: typeof rest & { passwordHash?: string } = { ...rest }
    if (newPassword) data.passwordHash = await hashPassword(newPassword)

    const member = await prisma.teamMember.update({ where: { id }, data, select: teamMemberSelect })
    res.status(200).json(member)
    return
  }

  if (req.method === "DELETE") {
    await prisma.teamMember.delete({ where: { id } })
    res.status(204).end()
    return
  }

  methodGuard(req, res, ["PATCH", "DELETE"])
})
