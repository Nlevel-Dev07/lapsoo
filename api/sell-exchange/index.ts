import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  city: z.literal("Gurgaon"),
  brand: z.string().min(1),
  age: z.enum(["Less than 1 year", "1-2 years", "2-4 years", "4+ years"]),
  condition: z.enum(["Excellent", "Good", "Fair", "Needs Repair"]),
  message: z.string().optional(),
  mediaUrls: z.array(z.string().url()).min(4, "Front, back, open, and video are all required"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid sell/exchange data", details: parsed.error.flatten() })
      return
    }
    const { email, ...rest } = parsed.data
    const lead = await prisma.sellExchangeLead.create({ data: { ...rest, email: email || undefined } })
    res.status(201).json({ id: lead.id })
    return
  }

  if (req.method === "GET") {
    const session = requireAdmin(req, res)
    if (!session) return
    const { status } = req.query
    const where: Record<string, unknown> = {}
    if (typeof status === "string") where.status = status
    const leads = await prisma.sellExchangeLead.findMany({ where, orderBy: { createdAt: "desc" } })
    res.status(200).json(leads)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
