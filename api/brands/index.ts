import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

const schema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url().optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    })
    res.status(200).json(
      brands.map((b) => ({ id: b.id, name: b.name, logoUrl: b.logoUrl, productCount: b._count.products }))
    )
    return
  }

  if (req.method === "POST") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid brand data" })
      return
    }
    const brand = await prisma.brand.create({ data: parsed.data })
    res.status(201).json(brand)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
