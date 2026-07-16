import type { VercelRequest, VercelResponse } from "@vercel/node"
import { clearSessionCookie } from "../_lib/auth"
import { withHandler, methodGuard } from "../_lib/handler"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return
  clearSessionCookie(res)
  res.status(200).json({ ok: true })
})
