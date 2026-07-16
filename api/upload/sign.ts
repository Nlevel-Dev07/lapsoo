import type { VercelRequest, VercelResponse } from "@vercel/node"
import { v2 as cloudinary } from "cloudinary"
import { withHandler, methodGuard } from "../_lib/handler"
import { requireAdmin } from "../_lib/auth"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default withHandler(async (req: VercelRequest, res: VercelResponse) => {
  if (!methodGuard(req, res, ["POST"])) return

  const session = requireAdmin(req, res)
  if (!session) return

  const timestamp = Math.round(Date.now() / 1000)
  const folder = "lapsoo"

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
