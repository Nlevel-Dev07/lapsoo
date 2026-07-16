import type { VercelRequest, VercelResponse } from "@vercel/node"

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void

export function withHandler(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (err) {
      console.error(err)
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" })
      }
    }
  }
}

export function methodGuard(req: VercelRequest, res: VercelResponse, allowed: string[]): boolean {
  if (!req.method || !allowed.includes(req.method)) {
    res.setHeader("Allow", allowed.join(", "))
    res.status(405).json({ error: `Method ${req.method} not allowed` })
    return false
  }
  return true
}
