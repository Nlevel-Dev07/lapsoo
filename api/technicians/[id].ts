import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const session = requireAdmin(req, res)
  if (!session) return

  const id = req.query.id as string

  if (req.method === "PATCH") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid technician update" })
      return
    }
    const technician = await prisma.technician.update({ where: { id }, data: parsed.data })
    res.status(200).json(technician)
    return
  }

  methodGuard(req, res, ["PATCH"])
})
