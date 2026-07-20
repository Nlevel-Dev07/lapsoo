import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { verifyPassword, signSession, setSessionCookie } from "../_lib/auth"
import { withHandler, methodGuard } from "../_lib/handler"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password format" })
    return
  }
  const { email, password } = parsed.data

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (admin && admin.active) {
    const valid = await verifyPassword(password, admin.passwordHash)
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" })
      return
    }

    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })

    const session = { id: admin.id, email: admin.email, name: admin.name, role: admin.role, type: "admin" as const, menuKeys: null }
    setSessionCookie(res, signSession(session))
    res.status(200).json(session)
    return
  }

  const member = await prisma.teamMember.findUnique({ where: { email }, include: { role: true } })
  if (!member || !member.active || !member.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }

  const valid = await verifyPassword(password, member.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }

  await prisma.teamMember.update({ where: { id: member.id }, data: { lastLoginAt: new Date() } })

  const menuKeys = Array.isArray(member.role?.menuKeys) ? (member.role!.menuKeys as string[]) : []
  const session = {
    id: member.id,
    email: member.email!,
    name: member.name,
    role: member.role?.name ?? "",
    type: "team" as const,
    menuKeys,
  }
  setSessionCookie(res, signSession(session))
  res.status(200).json(session)
})
