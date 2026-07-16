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
  if (!admin || !admin.active) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }

  const valid = await verifyPassword(password, admin.passwordHash)
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })

  const token = signSession({ id: admin.id, email: admin.email, name: admin.name, role: admin.role })
  setSessionCookie(res, token)

  res.status(200).json({ id: admin.id, email: admin.email, name: admin.name, role: admin.role })
})
