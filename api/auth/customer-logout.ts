import type { VercelRequest, VercelResponse } from "@vercel/node"
import { clearCustomerSessionCookie } from "../_lib/customerAuth"
import { withHandler, methodGuard } from "../_lib/handler"

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return
  clearCustomerSessionCookie(res)
  res.status(200).json({ ok: true })
})
