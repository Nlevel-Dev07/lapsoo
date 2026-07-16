import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  status: z.enum(["BOOKED", "DIAGNOSING", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED", "DELIVERED", "CANCELLED"]),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const session = requireAdmin(req, res)
  if (!session) return

  const id = req.query.id as string

  if (req.method === "PATCH") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid status" })
      return
    }
    const repair = await prisma.repairRequest.update({ where: { id }, data: { status: parsed.data.status } })
    res.status(200).json(repair)
    return
  }

  if (req.method === "DELETE") {
    await prisma.repairRequest.delete({ where: { id } })
    res.status(204).end()
    return
  }

  methodGuard(req, res, ["PATCH", "DELETE"])
})
