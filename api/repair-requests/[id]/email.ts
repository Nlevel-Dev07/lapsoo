import type { VercelRequest, VercelResponse } from "@vercel/node"
import { prisma } from "../../_lib/prisma"
import { withHandler, methodGuard } from "../../_lib/handler"
import { requireMenu } from "../../_lib/auth"
import { sendJobsheetEmail } from "../../_lib/email"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  const session = requireMenu(req, res, "repair")
  if (!session) return

  const id = req.query.id as string
  const repair = await prisma.repairRequest.findUnique({ where: { id } })
  if (!repair) {
    res.status(404).json({ error: "Repair not found" })
    return
  }
  if (!repair.email) {
    res.status(400).json({ error: "This repair has no email on file" })
    return
  }

  await sendJobsheetEmail(repair.email, {
    trackingCode: repair.trackingCode,
    name: repair.name,
    device: repair.device,
    issueType: repair.issueType,
    status: repair.status,
    estimateCost: repair.estimateCost,
    estimateTime: repair.estimateTime,
    store: repair.store,
  })

  res.status(200).json({ ok: true })
})
