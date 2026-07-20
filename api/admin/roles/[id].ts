import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireAdmin } from "../../_lib/auth"

const schema = z.object({
  name: z.string().min(2, "Enter a role name").optional(),
  menuKeys: z.array(z.string()).optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const session = requireAdmin(req, res)
  if (!session) return

  const id = req.query.id as string

  if (req.method === "PATCH") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid role update" })
      return
    }
    const role = await prisma.role.update({ where: { id }, data: parsed.data })
    res.status(200).json(role)
    return
  }

  if (req.method === "DELETE") {
    await prisma.role.delete({ where: { id } })
    res.status(204).end()
    return
  }

  methodGuard(req, res, ["PATCH", "DELETE"])
})
