import type { VercelRequest, VercelResponse } from "@vercel/node"
import { z } from "zod"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireMenu } from "../_lib/auth"

const schema = z
  .object({
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional().or(z.literal("")),
    city: z.literal("Gurgaon"),
    location: z.string().min(1, "Location is required"),
    deviceCategory: z.enum(["Laptop", "Monitor", "All in One", "Desktop", "Printer", "Other"]),
    deviceCategoryOther: z.string().optional(),
    brand: z.enum(["Dell", "Lenovo", "ASUS", "Acer", "Apple", "HP", "Other"]),
    brandOther: z.string().optional(),
    condition: z.enum(["Like New", "Medium", "Scratched"]),
    device: z.string().min(1),
    serialNumber: z.string().min(1, "Serial number is required"),
    password: z.string().optional(),
    accessories: z.array(z.string()).default([]),
    accessoriesOther: z.string().optional(),
    issueType: z.enum(["Screen", "Battery", "Keyboard", "SSD/RAM Upgrade", "Motherboard", "Data Recovery", "Other"]),
    issueTypeOther: z.string().optional(),
    message: z.string().optional(),
    mediaUrls: z.array(z.string().url()).min(4, "Front, back, open, and video are all required"),
    store: z.string().min(1, "Select a store"),
  })
  .refine((d) => d.deviceCategory !== "Other" || !!d.deviceCategoryOther?.trim(), {
    message: "Please specify the device category",
    path: ["deviceCategoryOther"],
  })
  .refine((d) => d.brand !== "Other" || !!d.brandOther?.trim(), {
    message: "Please specify the brand",
    path: ["brandOther"],
  })
  .refine((d) => d.issueType !== "Other" || !!d.issueTypeOther?.trim(), {
    message: "Please specify the issue",
    path: ["issueTypeOther"],
  })
  .refine((d) => !d.accessories.includes("Other") || !!d.accessoriesOther?.trim(), {
    message: "Please specify the accessory",
    path: ["accessoriesOther"],
  })

function generateTrackingCode() {
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `LT-${rand}`
}

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  const session = requireMenu(req, res, "repair")
  if (!session) return

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid jobsheet data", details: parsed.error.flatten() })
    return
  }
  const { email, ...rest } = parsed.data

  let trackingCode = generateTrackingCode()
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.repairRequest.findUnique({ where: { trackingCode } })
    if (!exists) break
    trackingCode = generateTrackingCode()
  }

  const repair = await prisma.repairRequest.create({
    data: { ...rest, email: email || undefined, trackingCode, type: "WALK_IN", createdByName: session.name },
  })
  res.status(201).json({ id: repair.id, trackingCode: repair.trackingCode })
})
