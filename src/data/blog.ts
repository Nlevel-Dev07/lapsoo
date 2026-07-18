export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: "Buying Guide" | "Comparison" | "Repair Tips" | "Upgrade Guide" | "Business IT" | "Student Guide"
  readTime: string
  date: string
  gradientFrom?: string
  gradientTo?: string
  coverImage?: string
  content: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: "certified-refurbished-vs-new-laptop",
    title: "Certified Refurbished vs New Laptop: What Should You Actually Buy in 2026?",
    excerpt:
      "A certified refurbished laptop can save you up to 40% — but only if it's graded and tested properly. Here's how to decide.",
    category: "Buying Guide",
    readTime: "6 min read",
    date: "2026-06-18",
    gradientFrom: "#2f5eff",
    gradientTo: "#0b0c10",
    content: [
      "Refurbished doesn't mean compromised — when it's done right, it means tested, graded, and backed by warranty.",
      "At Lapsoo, every LapAndTop device passes a 120-point diagnostic covering battery health, screen uniformity, keyboard response, thermal performance, and port functionality before it's listed.",
      "The right choice depends on your use case: a certified refurbished business laptop is excellent for everyday productivity and study, while brand-new is better if you need the absolute latest chipset, GPU, or a long single-owner warranty runway.",
      "Our recommendation: for students and standard business use, refurbished offers the best value per rupee. For gaming, content creation, and enterprise fleets needing uniform warranty timelines, new is the safer bet.",
    ],
  },
  {
    slug: "how-to-choose-laptop-for-college",
    title: "The Complete Laptop Buying Guide for College Students",
    excerpt:
      "RAM, storage, battery life, and budget — everything a student needs to know before choosing a laptop for college.",
    category: "Student Guide",
    readTime: "7 min read",
    date: "2026-06-10",
    gradientFrom: "#1e46e0",
    gradientTo: "#121319",
    content: [
      "For most college coursework — documents, browsers, video calls, and light coding — 8GB RAM and a 256GB SSD is the practical minimum in 2026.",
      "If your course involves design, engineering CAD, or data science, aim for 16GB RAM and a dedicated GPU where budget allows.",
      "Battery life matters more than raw specs for day-to-day campus use — look for a rated 8+ hours of real-world battery life, not just the marketing number.",
      "Lapsoo's Student Laptops range is curated specifically around this balance, with EMI options and a callback-based enquiry process instead of pressure-selling.",
    ],
  },
  {
    slug: "signs-your-laptop-needs-ssd-upgrade",
    title: "5 Signs Your Laptop Needs an SSD Upgrade (Not a Replacement)",
    excerpt:
      "Slow boot times and lag don't always mean you need a new laptop. An SSD upgrade can add years of usable life.",
    category: "Upgrade Guide",
    readTime: "4 min read",
    date: "2026-05-28",
    gradientFrom: "#0d7a5f",
    gradientTo: "#0b0c10",
    content: [
      "If your laptop takes over a minute to boot, an HDD-to-SSD swap is usually the single highest-impact upgrade available.",
      "Watch for: slow app launches, extended 'disk usage 100%' periods in Task Manager, laptop freezing during multitasking, and long file-copy times.",
      "Most business and student laptops from 2018 onward can be upgraded to NVMe SSDs, often doubling perceived speed for a fraction of the cost of a new machine.",
      "LapTech offers same-day SSD upgrades with data migration included, so you don't lose your files during the switch.",
    ],
  },
  {
    slug: "corporate-laptop-procurement-checklist",
    title: "Corporate Laptop Procurement: A Checklist for IT Managers",
    excerpt:
      "From GST billing to asset tagging — what your procurement process should cover before placing a bulk laptop order.",
    category: "Business IT",
    readTime: "5 min read",
    date: "2026-05-15",
    gradientFrom: "#1533a8",
    gradientTo: "#0b0c10",
    content: [
      "Bulk procurement isn't just about unit price — factor in warranty uniformity, spare-unit availability, and turnaround time for replacements.",
      "Always confirm GST-compliant billing and asset documentation upfront; this saves significant friction during your internal audit cycles.",
      "A dedicated account manager materially reduces procurement time for teams ordering 10+ units, since spec finalization and delivery scheduling move in parallel.",
      "Lapsoo's Corporate Solutions team handles onboarding kits, imaging, and staggered delivery for distributed teams across India.",
    ],
  },
  {
    slug: "macbook-vs-windows-business-laptop",
    title: "MacBook vs Windows Business Laptop: Making the Right Call for Your Team",
    excerpt:
      "Total cost of ownership, software compatibility, and team familiarity — a practical comparison for growing businesses.",
    category: "Comparison",
    readTime: "6 min read",
    date: "2026-04-30",
    gradientFrom: "#3a3d47",
    gradientTo: "#0b0c10",
    content: [
      "MacBooks typically hold resale value better and offer longer OS support cycles, which matters for a 3-4 year refresh strategy.",
      "Windows business laptops usually win on upfront cost, hardware configurability, and compatibility with legacy enterprise software.",
      "For creative and engineering teams already inside the Apple ecosystem, MacBooks reduce friction. For finance, sales, and ops teams running Windows-only tools, stick with a business-grade Windows machine.",
      "Lapsoo stocks both new and certified refurbished MacBooks, so teams can mix procurement strategy by department without vendor sprawl.",
    ],
  },
  {
    slug: "common-laptop-screen-issues",
    title: "6 Common Laptop Screen Issues and What Actually Causes Them",
    excerpt:
      "Flickering, lines, dead pixels, and dim displays — how to tell what's fixable and what needs a full panel replacement.",
    category: "Repair Tips",
    readTime: "5 min read",
    date: "2026-04-12",
    gradientFrom: "#a41e2f",
    gradientTo: "#0b0c10",
    content: [
      "Flickering is often a loose display cable rather than a panel fault — an easy, low-cost fix if caught early.",
      "Vertical or horizontal lines usually indicate physical panel damage and require a full screen replacement.",
      "A dim display that brightens when you press near the hinge points to a failing cable connector, not the backlight itself.",
      "LapTech provides free diagnostics before quoting any screen repair, so you're never paying for a replacement you don't need.",
    ],
  },
]

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
}
