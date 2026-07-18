import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"
import { getCustomerSession } from "../_lib/customerAuth"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal("")),
  city: z.literal("Gurgaon"),
  location: z.string().min(1, "Location is required"),
  deviceCategory: z.enum(["Laptop", "Monitor", "All in One", "Desktop", "Printer", "Other"]),
  brand: z.enum(["Dell", "Lenovo", "ASUS", "Acer", "Apple", "HP", "Other"]),
  condition: z.enum(["Like New", "Medium", "Scratched"]),
  device: z.string().min(1),
  serialNumber: z.string().optional(),
  password: z.string().optional(),
  accessories: z.array(z.string()).default([]),
  issueType: z.enum(["Screen", "Battery", "Keyboard", "SSD/RAM Upgrade", "Motherboard", "Data Recovery", "Other"]),
  message: z.string().optional(),
  mediaUrls: z.array(z.string().url()).min(4, "Front, back, open, and video are all required"),
})

function generateTrackingCode() {
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `LT-${rand}`
}

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === "POST") {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid repair booking data", details: parsed.error.flatten() })
      return
    }
    const { email, ...rest } = parsed.data
    const customerSession = getCustomerSession(req)

    let trackingCode = generateTrackingCode()
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.repairRequest.findUnique({ where: { trackingCode } })
      if (!exists) break
      trackingCode = generateTrackingCode()
    }

    const repair = await prisma.repairRequest.create({
      data: { ...rest, email: email || undefined, trackingCode, customerId: customerSession?.id },
    })
    res.status(201).json({ id: repair.id, trackingCode: repair.trackingCode })
    return
  }

  if (req.method === "GET") {
    const session = requireAdmin(req, res)
    if (!session) return
    const { status } = req.query
    const where: Record<string, unknown> = {}
    if (typeof status === "string") where.status = status
    const repairs = await prisma.repairRequest.findMany({ where, orderBy: { createdAt: "desc" }, include: { technician: true } })
    res.status(200).json(repairs)
    return
  }

  methodGuard(req, res, ["GET", "POST"])
})
