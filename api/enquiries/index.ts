import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  source: z.enum(["GENERAL_ENQUIRY", "PRODUCT_ENQUIRY", "CALLBACK_REQUEST"]),
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  city: z.literal("Gurgaon"),
  message: z.string().optional(),
  productId: z.string().optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid enquiry data", details: parsed.error.flatten() })
      return
    }
    const { email, ...rest } = parsed.data
    const enquiry = await prisma.enquiry.create({
      data: { ...rest, email: email || undefined },
    })
    res.status(201).json({ id: enquiry.id })
    return
  }

  if (req.method === "GET") {
    const session = requireAdmin(req, res)
    if (!session) return

    const { status, source } = req.query
    const where: Record<string, unknown> = {}
    if (typeof status === "string") where.status = status
    if (typeof source === "string") where.source = source

    const enquiries = await prisma.enquiry.findMany({
      where,
      include: { product: { select: { model: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    })
    res.status(200).json(enquiries)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
