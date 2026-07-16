import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin, getSession } from "../_lib/auth"
import {
  serializeProduct,
  ecosystemToDb,
  categoryToDb,
  conditionToDb,
  availabilityToDb,
} from "../_lib/mappers"

const productSchema = z.object({
  slug: z.string().min(2),
  brandName: z.string().min(1),
  model: z.string().min(1),
  category: z.enum(["Business", "Student", "Gaming", "Workstation", "MacBook", "2-in-1"]),
  condition: z.enum(["New", "Certified Refurbished"]),
  ecosystem: z.enum(["lapandtop", "laptopbazaar"]),
  priceFrom: z.number().int().positive(),
  processor: z.string().min(1),
  ram: z.string().min(1),
  storage: z.string().min(1),
  display: z.string().min(1),
  graphics: z.string().min(1),
  battery: z.string().min(1),
  warranty: z.string().min(1),
  screenSize: z.number().positive(),
  availability: z.enum(["In Stock", "Limited Stock", "On Order"]).default("In Stock"),
  highlights: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const { ecosystem, category, brand } = req.query
    const where: Record<string, unknown> = {}

    // Only admins (valid session) can see unpublished products
    const isAdminRequest = Boolean(getSession(req))
    if (!isAdminRequest) where.published = true

    if (typeof ecosystem === "string" && ecosystem in ecosystemToDb) {
      where.ecosystem = ecosystemToDb[ecosystem as keyof typeof ecosystemToDb]
    }
    if (typeof category === "string" && category in categoryToDb) {
      where.category = categoryToDb[category as keyof typeof categoryToDb]
    }
    if (typeof brand === "string") {
      where.brand = { name: brand }
    }

    const products = await prisma.product.findMany({
      where,
      include: { brand: true, images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    })
    res.status(200).json(products.map(serializeProduct))
    return
  }

  if (req.method === "POST") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = productSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid product data", details: parsed.error.flatten() })
      return
    }
    const data = parsed.data

    const brand = await prisma.brand.upsert({
      where: { name: data.brandName },
      update: {},
      create: { name: data.brandName },
    })

    const product = await prisma.product.create({
      data: {
        slug: data.slug,
        brandId: brand.id,
        model: data.model,
        category: categoryToDb[data.category],
        condition: conditionToDb[data.condition],
        ecosystem: ecosystemToDb[data.ecosystem],
        priceFrom: data.priceFrom,
        processor: data.processor,
        ram: data.ram,
        storage: data.storage,
        display: data.display,
        graphics: data.graphics,
        battery: data.battery,
        warranty: data.warranty,
        screenSize: data.screenSize,
        availability: availabilityToDb[data.availability],
        highlights: data.highlights,
        published: data.published,
        images: {
          create: data.images.map((url, i) => ({ url, publicId: url, position: i })),
        },
      },
      include: { brand: true, images: true },
    })

    res.status(201).json(serializeProduct(product))
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
