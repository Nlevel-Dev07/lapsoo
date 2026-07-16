import type { VercelRequest, VercelResponse } from "@vercel/node"
import { v2 as cloudinary } from "cloudinary"
import { withHandler, methodGuard } from "../_lib/handler"
import { isRateLimited } from "../_lib/rateLimit"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const SOURCES = ["repair", "sell-exchange"] as const
type Source = (typeof SOURCES)[number]

function isSource(value: unknown): value is Source {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value)
}

/**
 * Public, unauthenticated signing endpoint used by the repair-booking and sell/exchange
 * lead forms to attach photos/videos. Scoped to a dedicated Cloudinary folder per source
 * and rate-limited per IP; upload size/type limits should additionally be enforced via
 * a Cloudinary upload preset on the dashboard since anyone with the page open can call this.
 */
export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  if (isRateLimited(req, "lead-media-sign", 30, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many upload requests. Please try again shortly." })
    return
  }

  const source = req.body?.source
  if (!isSource(source)) {
    res.status(400).json({ error: "Invalid or missing source" })
    return
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = `lapsoo/leads/${source}`

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  )

  res.status(200).json({
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  })
})
