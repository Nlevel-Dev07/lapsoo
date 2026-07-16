import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"
import { serializeBlogPost } from "../_lib/mappers"

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  excerpt: z.string().min(2).max(500).optional(),
  category: z.enum(["Buying Guide", "Comparison", "Repair Tips", "Upgrade Guide", "Business IT", "Student Guide"]).optional(),
  content: z.array(z.string()).optional(),
  coverImage: z.string().url().optional(),
  readTime: z.string().optional(),
  published: z.boolean().optional(),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  const id = req.query.id as string

  if (req.method === "GET") {
    const post = await prisma.blogPost.findFirst({ where: { OR: [{ id }, { slug: id }] } })
    if (!post) {
      res.status(404).json({ error: "Post not found" })
      return
    }
    res.status(200).json(serializeBlogPost(post))
    return
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = updateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data" })
      return
    }
    const post = await prisma.blogPost.update({ where: { id }, data: parsed.data })
    res.status(200).json(serializeBlogPost(post))
    return
  }

  if (req.method === "DELETE") {
    const session = requireAdmin(req, res)
    if (!session) return
    await prisma.blogPost.delete({ where: { id } })
    res.status(204).end()
    return
  }

  methodGuard(req, res, ["GET", "PUT", "PATCH", "DELETE"])
})
