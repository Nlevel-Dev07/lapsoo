import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return

  const code = req.query.code
  if (typeof code !== "string" || !code.trim()) {
    res.status(400).json({ error: "Tracking code is required" })
    return
  }

  const repair = await prisma.repairRequest.findUnique({
    where: { trackingCode: code.trim().toUpperCase() },
    select: {
      trackingCode: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      location: true,
      deviceCategory: true,
      deviceCategoryOther: true,
      brand: true,
      brandOther: true,
      condition: true,
      device: true,
      serialNumber: true,
      accessories: true,
      accessoriesOther: true,
      issueType: true,
      issueTypeOther: true,
      message: true,
      mediaUrls: true,
      estimateCost: true,
      estimateTime: true,
      status: true,
      store: true,
      createdAt: true,
    },
  })

  if (!repair) {
    res.status(404).json({ error: "No jobsheet found for this tracking ID" })
    return
  }

  res.status(200).json(repair)
})
