import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireMenu } from "../../_lib/auth"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return

  const session = requireMenu(req, res, "teams")
  if (!session) return

  const rows = await prisma.teamMember.findMany({
    where: { designation: { not: null } },
    select: { designation: true },
    distinct: ["designation"],
    orderBy: { designation: "asc" },
  })
  res.status(200).json(rows.map((r) => r.designation).filter(Boolean))
})
