import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireAdmin } from "../../_lib/auth"

const createSchema = z.object({
  name: z.string().min(2, "Enter a role name"),
  menuKeys: z.array(z.string()).default([]),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const session = requireAdmin(req, res)
    if (!session) return

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { teamMembers: true } } },
    })
    res.status(200).json(roles)
    return
  }

  if (req.method === "POST") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid role data" })
      return
    }

    const existing = await prisma.role.findUnique({ where: { name: parsed.data.name } })
    if (existing) {
      res.status(409).json({ error: "A role with this name already exists" })
      return
    }

    const role = await prisma.role.create({ data: parsed.data })
    res.status(201).json(role)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
