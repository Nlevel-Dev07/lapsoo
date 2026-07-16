import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"
import { ecosystemToDb, categoryToDb, conditionToDb, availabilityToDb } from "../_lib/mappers"

const MAX_ROWS = 500

const rowSchema = z.object({
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
  images: z.array(z.string().url()).default([]),
  published: z.boolean().default(true),
})

const bulkSchema = z.object({
  products: z.array(z.record(z.string(), z.unknown())).min(1).max(MAX_ROWS),
})

interface RowResult {
  row: number
  status: "created" | "updated" | "error"
  slug?: string
  error?: string
}

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    methodGuard(req, res, ["POST"])
    return
  }

  const session = requireAdmin(req, res)
  if (!session) return

  const parsedBody = bulkSchema.safeParse(req.body)
  if (!parsedBody.success) {
    res.status(400).json({ error: `Invalid request body (max ${MAX_ROWS} rows per import)`, details: parsedBody.error.flatten() })
    return
  }

  const results: RowResult[] = []

  for (let i = 0; i < parsedBody.data.products.length; i++) {
    // Spreadsheet row 1 is the header, so data rows start at 2.
    const rowNum = i + 2
    const parsed = rowSchema.safeParse(parsedBody.data.products[i])
    if (!parsed.success) {
      results.push({
        row: rowNum,
        status: "error",
        error: parsed.error.issues.map((e) => `${e.path.join(".") || "row"}: ${e.message}`).join("; "),
      })
      continue
    }

    const data = parsed.data
    try {
      const brand = await prisma.brand.upsert({
        where: { name: data.brandName },
        update: {},
        create: { name: data.brandName },
      })

      const existing = await prisma.product.findUnique({ where: { slug: data.slug } })

      const productData = {
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
      }

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            ...productData,
            ...(data.images.length > 0
              ? { images: { deleteMany: {}, create: data.images.map((url, idx) => ({ url, publicId: url, position: idx })) } }
              : {}),
          },
        })
        results.push({ row: rowNum, status: "updated", slug: data.slug })
      } else {
        await prisma.product.create({
          data: {
            slug: data.slug,
            ...productData,
            images: { create: data.images.map((url, idx) => ({ url, publicId: url, position: idx })) },
          },
        })
        results.push({ row: rowNum, status: "created", slug: data.slug })
      }
    } catch (err) {
      results.push({
        row: rowNum,
        status: "error",
        slug: data.slug,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  res.status(200).json({
    created: results.filter((r) => r.status === "created").length,
    updated: results.filter((r) => r.status === "updated").length,
    failed: results.filter((r) => r.status === "error").length,
    results,
  })
})
