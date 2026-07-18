import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../_lib/prisma"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireCustomer } from "../_lib/customerAuth"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return

  const session = requireCustomer(req, res)
  if (!session) return

  const repairs = await prisma.repairRequest.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
  })
  res.status(200).json(repairs)
})
