import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  company: z.string().min(1),
  quantity: z.enum(["1-10", "11-50", "51-200", "200+"]),
  gstin: z.string().optional(),
  message: z.string().optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid corporate lead data", details: parsed.error.flatten() })
      return
    }
    const { email, ...rest } = parsed.data
    const lead = await prisma.corporateLead.create({ data: { ...rest, email: email || undefined } })
    res.status(201).json({ id: lead.id })
    return
  }

  if (req.method === "GET") {
    const session = requireAdmin(req, res)
    if (!session) return
    const { status } = req.query
    const where: Record<string, unknown> = {}
    if (typeof status === "string") where.status = status
    const leads = await prisma.corporateLead.findMany({ where, orderBy: { createdAt: "desc" } })
    res.status(200).json(leads)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
