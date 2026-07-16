import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin, getSession } from "../_lib/auth"
import { serializeBlogPost } from "../_lib/mappers"

const schema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().min(2).max(500),
  category: z.enum(["Buying Guide", "Comparison", "Repair Tips", "Upgrade Guide", "Business IT", "Student Guide"]),
  content: z.array(z.string()).min(1),
  coverImage: z.string().url().optional(),
  readTime: z.string().min(1),
  published: z.boolean().default(true),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const isAdminRequest = Boolean(getSession(req))
    const posts = await prisma.blogPost.findMany({
      where: isAdminRequest ? {} : { published: true },
      orderBy: { publishedAt: "desc" },
    })
    res.status(200).json(posts.map(serializeBlogPost))
    return
  }

  if (req.method === "POST") {
    const session = requireAdmin(req, res)
    if (!session) return

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid blog post data", details: parsed.error.flatten() })
      return
    }
    const post = await prisma.blogPost.create({ data: parsed.data })
    res.status(201).json(serializeBlogPost(post))
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
