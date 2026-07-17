import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getCustomerSession } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return
  const session = getCustomerSession(req)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  res.status(200).json(session)
})
