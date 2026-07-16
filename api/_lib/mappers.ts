// Maps between Prisma enum values and the plain strings the frontend already uses.

export const ecosystemToDb = { lapandtop: "LAPANDTOP", laptopbazaar: "LAPTOPBAZAAR" } as const
export const ecosystemFromDb = { LAPANDTOP: "lapandtop", LAPTOPBAZAAR: "laptopbazaar" } as const

export const conditionToDb = { New: "NEW", "Certified Refurbished": "CERTIFIED_REFURBISHED" } as const
export const conditionFromDb = { NEW: "New", CERTIFIED_REFURBISHED: "Certified Refurbished" } as const

export const categoryToDb = {
  Business: "BUSINESS",
  Student: "STUDENT",
  Gaming: "GAMING",
  Workstation: "WORKSTATION",
  MacBook: "MACBOOK",
  "2-in-1": "TWO_IN_ONE",
} as const
export const categoryFromDb = {
  BUSINESS: "Business",
  STUDENT: "Student",
  GAMING: "Gaming",
  WORKSTATION: "Workstation",
  MACBOOK: "MacBook",
  TWO_IN_ONE: "2-in-1",
} as const

export const availabilityToDb = {
  "In Stock": "IN_STOCK",
  "Limited Stock": "LIMITED_STOCK",
  "On Order": "ON_ORDER",
} as const
export const availabilityFromDb = {
  IN_STOCK: "In Stock",
  LIMITED_STOCK: "Limited Stock",
  ON_ORDER: "On Order",
} as const

type DbProduct = {
  id: string
  slug: string
  brand: { name: string }
  model: string
  category: keyof typeof categoryFromDb
  condition: keyof typeof conditionFromDb
  ecosystem: keyof typeof ecosystemFromDb
  priceFrom: number
  processor: string
  ram: string
  storage: string
  display: string
  graphics: string
  battery: string
  warranty: string
  screenSize: number
  availability: keyof typeof availabilityFromDb
  highlights: unknown
  published: boolean
  images?: { url: string }[]
}

type DbBlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  content: unknown
  coverImage: string | null
  readTime: string
  published: boolean
  publishedAt: Date
}

export function serializeBlogPost(p: DbBlogPost) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    content: Array.isArray(p.content) ? p.content : [],
    coverImage: p.coverImage,
    readTime: p.readTime,
    published: p.published,
    date: p.publishedAt.toISOString(),
  }
}

export function serializeProduct(p: DbProduct) {
  return {
    id: p.id,
    slug: p.slug,
    brand: p.brand.name,
    model: p.model,
    category: categoryFromDb[p.category],
    condition: conditionFromDb[p.condition],
    ecosystem: ecosystemFromDb[p.ecosystem],
    priceFrom: p.priceFrom,
    processor: p.processor,
    ram: p.ram,
    storage: p.storage,
    display: p.display,
    graphics: p.graphics,
    battery: p.battery,
    warranty: p.warranty,
    screenSize: p.screenSize,
    availability: availabilityFromDb[p.availability],
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
    published: p.published,
    images: (p.images ?? []).map((i) => i.url),
  }
}
