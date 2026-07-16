import "dotenv/config"
import express from "express"
import cors from "cors"
import path from "node:path"
import fg from "fast-glob"
import { pathToFileURL } from "node:url"

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 3001)
const apiDir = path.resolve(process.cwd(), "api")

// ALLOWED_ORIGIN can be a single origin or a comma-separated list (e.g. Vercel
// production domain + preview deployments). Falls back to the local Vite dev server.
const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())

async function main() {
  const app = express()
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true)
        else callback(new Error(`Origin ${origin} not allowed by CORS`))
      },
      credentials: true,
    })
  )
  app.use(express.json())

  // Static routes must be registered before dynamic ones (e.g. products/bulk-import.ts
  // before products/[id].ts), or Express matches the dynamic segment first. fast-glob's
  // order isn't guaranteed, so sort explicitly rather than relying on it.
  const files = (await fg("**/*.ts", { cwd: apiDir, ignore: ["_lib/**"] })).sort((a, b) => {
    const aDynamic = a.includes("[")
    const bDynamic = b.includes("[")
    if (aDynamic === bDynamic) return a.localeCompare(b)
    return aDynamic ? 1 : -1
  })

  for (const file of files) {
    const routePath =
      "/api/" +
      file
        .replace(/\.ts$/, "")
        .replace(/\/index$/, "")
        .replace(/\[([^\]]+)\]/g, ":$1")

    const finalPath = routePath === "/api/" ? "/api" : routePath
    const mod = await import(pathToFileURL(path.join(apiDir, file)).href)
    const handler = mod.default

    app.all(finalPath, async (req, res) => {
      // Vercel's runtime merges dynamic route params into req.query; Express puts them in
      // req.params instead, and Express 5's req.query is a getter-only accessor, so it must
      // be redefined (not just mutated or reassigned) to include the route params too.
      Object.defineProperty(req, "query", {
        value: { ...req.query, ...req.params },
        writable: true,
        configurable: true,
        enumerable: true,
      })
      await handler(req, res)
    })

    console.log(`  ${finalPath}  <-  api/${file}`)
  }

  app.listen(PORT, () => {
    console.log(`\nAPI server ready on port ${PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
