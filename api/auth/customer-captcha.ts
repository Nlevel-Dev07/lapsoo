import type { VercelRequest, VercelResponse } from "@vercel/node"
import jwt from "jsonwebtoken"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"

const JWT_SECRET = process.env.JWT_SECRET as string

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["GET"])) return

  if (isRateLimited(req, "customer-captcha", 30, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many requests. Please try again shortly." })
    return
  }

  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  const token = jwt.sign({ purpose: "login-captcha", a, b }, JWT_SECRET, { expiresIn: "3m" })

  res.status(200).json({ token, question: `What is ${a} + ${b}?` })
})
