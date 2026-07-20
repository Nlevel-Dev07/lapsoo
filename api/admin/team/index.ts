import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireMenu, hashPassword } from "../../_lib/auth"

const teamMemberSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  designation: true,
  store: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  role: { select: { id: true, name: true, menuKeys: true } },
} as const

const createSchema = z.object({
  name: z.string().min(2, "Enter a full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  designation: z.string().optional(),
  store: z.string().optional(),
  roleId: z.string().nullable().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "GET") {
    const session = requireMenu(req, res, "teams")
    if (!session) return

    const members = await prisma.teamMember.findMany({
      orderBy: { createdAt: "desc" },
      select: teamMemberSelect,
    })
    res.status(200).json(members)
    return
  }

  if (req.method === "POST") {
    const session = requireMenu(req, res, "teams")
    if (!session) return

    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid team member data" })
      return
    }
    const { email, password, ...rest } = parsed.data

    const existing = await prisma.teamMember.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: "A team member with this email already exists" })
      return
    }

    const passwordHash = await hashPassword(password)
    const member = await prisma.teamMember.create({
      data: { ...rest, email, passwordHash },
      select: teamMemberSelect,
    })
    res.status(201).json(member)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
