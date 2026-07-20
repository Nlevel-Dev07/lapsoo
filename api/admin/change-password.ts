import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin, hashPassword, verifyPassword } from "../_lib/auth"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  const session = requireAdmin(req, res)
  if (!session) return

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid password data" })
    return
  }
  const { currentPassword, newPassword } = parsed.data

  if (session.type === "admin") {
    const admin = await prisma.adminUser.findUnique({ where: { id: session.id } })
    if (!admin || !(await verifyPassword(currentPassword, admin.passwordHash))) {
      res.status(401).json({ error: "Current password is incorrect" })
      return
    }
    await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(newPassword) } })
  } else {
    const member = await prisma.teamMember.findUnique({ where: { id: session.id } })
    if (!member || !member.passwordHash || !(await verifyPassword(currentPassword, member.passwordHash))) {
      res.status(401).json({ error: "Current password is incorrect" })
      return
    }
    await prisma.teamMember.update({ where: { id: member.id }, data: { passwordHash: await hashPassword(newPassword) } })
  }

  res.status(200).json({ ok: true })
})
