import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const session = requireAdmin(req, res)
  if (!session) return

  if (req.method === "GET") {
    const technicians = await prisma.technician.findMany({ orderBy: { name: "asc" } })
    res.status(200).json(technicians)
    return
  }

  if (req.method === "POST") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid technician data", details: parsed.error.flatten() })
      return
    }
    const technician = await prisma.technician.create({ data: parsed.data })
    res.status(201).json(technician)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
