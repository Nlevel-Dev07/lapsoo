import type { VercelRequest, VercelResponse } from "@vercel/node"
import { getSession } from "../_lib/auth"
import { withHandler, methodGuard } from "../_lib/handler"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return
  const session = getSession(req)
  if (!session) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  res.status(200).json(session)
})
