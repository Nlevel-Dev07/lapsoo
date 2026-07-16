import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import bcrypt from "bcryptjs"
import { products as staticProducts } from "../src/data/products"
import { blogPosts as staticBlogPosts } from "../src/data/blog"
import {
  ecosystemToDb,
  categoryToDb,
  conditionToDb,
  availabilityToDb,
} from "../api/_lib/mappers"

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding brands & products...")
  for (const p of staticProducts) {
    const brand = await prisma.brand.upsert({
      where: { name: p.brand },
      update: {},
      create: { name: p.brand },
    })

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        brandId: brand.id,
        model: p.model,
        category: categoryToDb[p.category],
        condition: conditionToDb[p.condition],
        ecosystem: ecosystemToDb[p.ecosystem],
        priceFrom: p.priceFrom,
        processor: p.processor,
        ram: p.ram,
        storage: p.storage,
        display: p.display,
        graphics: p.graphics,
        battery: p.battery,
        warranty: p.warranty,
        screenSize: p.screenSize,
        availability: availabilityToDb[p.availability],
        highlights: p.highlights,
        published: true,
      },
    })
  }
  console.log(`  -> ${staticProducts.length} products ready`)

  console.log("Seeding blog posts...")
  for (const post of staticBlogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        content: post.content,
        readTime: post.readTime,
        publishedAt: new Date(post.date),
        published: true,
      },
    })
  }
  console.log(`  -> ${staticBlogPosts.length} blog posts ready`)

  const adminEmail = process.env.ADMIN_SEED_EMAIL
  const adminPassword = process.env.ADMIN_SEED_PASSWORD
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: "Lapsoo Admin",
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
      },
    })
    console.log(`  -> Admin user ready: ${adminEmail}`)
  } else {
    console.warn("  -> Skipped admin user seed: ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set")
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
