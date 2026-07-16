import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"
import {
  serializeProduct,
  ecosystemToDb,
  categoryToDb,
  conditionToDb,
  availabilityToDb,
} from "../_lib/mappers"

const updateSchema = z.object({
  brandName: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  category: z.enum(["Business", "Student", "Gaming", "Workstation", "MacBook", "2-in-1"]).optional(),
  condition: z.enum(["New", "Certified Refurbished"]).optional(),
  ecosystem: z.enum(["lapandtop", "laptopbazaar"]).optional(),
  priceFrom: z.number().int().positive().optional(),
  processor: z.string().min(1).optional(),
  ram: z.string().min(1).optional(),
  storage: z.string().min(1).optional(),
  display: z.string().min(1).optional(),
  graphics: z.string().min(1).optional(),
  battery: z.string().min(1).optional(),
  warranty: z.string().min(1).optional(),
  screenSize: z.number().positive().optional(),
  availability: z.enum(["In Stock", "Limited Stock", "On Order"]).optional(),
  highlights: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const id = req.query.id as string

  if (req.method === "GET") {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { brand: true, images: { orderBy: { position: "asc" } } },
    })
    if (!product) {
      res.status(404).json({ error: "Product not found" })
      return
    }
    res.status(200).json(serializeProduct(product))
    return
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid product data", details: parsed.error.flatten() })
      return
    }
    const data = parsed.data

    let brandId: string | undefined
    if (data.brandName) {
      const brand = await prisma.brand.upsert({
        where: { name: data.brandName },
        update: {},
        create: { name: data.brandName },
      })
      brandId = brand.id
    }

    if (data.images) {
      await prisma.productImage.deleteMany({ where: { productId: id } })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(brandId && { brandId }),
        ...(data.model && { model: data.model }),
        ...(data.category && { category: categoryToDb[data.category] }),
        ...(data.condition && { condition: conditionToDb[data.condition] }),
        ...(data.ecosystem && { ecosystem: ecosystemToDb[data.ecosystem] }),
        ...(data.priceFrom !== undefined && { priceFrom: data.priceFrom }),
        ...(data.processor && { processor: data.processor }),
        ...(data.ram && { ram: data.ram }),
        ...(data.storage && { storage: data.storage }),
        ...(data.display && { display: data.display }),
        ...(data.graphics && { graphics: data.graphics }),
        ...(data.battery && { battery: data.battery }),
        ...(data.warranty && { warranty: data.warranty }),
        ...(data.screenSize !== undefined && { screenSize: data.screenSize }),
        ...(data.availability && { availability: availabilityToDb[data.availability] }),
        ...(data.highlights && { highlights: data.highlights }),
        ...(data.published !== undefined && { published: data.published }),
        ...(data.images && {
          images: { create: data.images.map((url, i) => ({ url, publicId: url, position: i })) },
        }),
      },
      include: { brand: true, images: { orderBy: { position: "asc" } } },
    })

    res.status(200).json(serializeProduct(product))
    return
  }

  if (req.method === "DELETE") {
    const session = requireAdmin(req, res)
    if (!session) return

    await prisma.product.delete({ where: { id } })
    res.status(204).end()
    return
  }

  methodGuard(req, res, ["GET", "PUT", "PATCH", "DELETE"])
})
