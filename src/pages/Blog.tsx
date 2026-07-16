import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/data/blog"
import { useSeo } from "@/lib/useSeo"
import { fetchBlogPosts } from "@/lib/api"
import { productGradient } from "@/lib/gradient"

export default function Blog() {
  useSeo({
    title: "Blog — Laptop Buying Guides & Tips",
    description: "Laptop buying guides, comparisons, repair tips, upgrade guides, and business IT advice from the Lapsoo team.",
  })

  const { data: blogPosts, isLoading, isError } = useQuery({ queryKey: ["blog"], queryFn: fetchBlogPosts })

  return (
    <div>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-ink/8">
        <div className="container-lap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">Lapsoo Blog</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              Buying guides, repair tips, and honest comparisons.
            </h1>
            <p className="mt-4 text-ink/55 max-w-xl leading-relaxed">
              Practical advice for students, professionals, and IT managers — written by the Lapsoo product and repair teams.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-lap">
          {isLoading ? (
            <div className="text-center text-ink/45">Loading articles…</div>
          ) : isError || !blogPosts?.length ? (
            <div className="text-center text-ink/45">Couldn't load articles right now. Please check back shortly.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => {
                const gradient = post.gradientFrom && post.gradientTo
                  ? { from: post.gradientFrom, to: post.gradientTo }
                  : productGradient(post.slug)
                return (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group block h-full rounded-3xl border border-ink/8 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                    >
                      <div
                        className="aspect-[16/9]"
                        style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                      />
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-xs text-ink/40 font-semibold uppercase tracking-wide">
                          <span className="text-blue-600">{post.category}</span>
                          <span>·</span>
                          <span>{post.readTime}</span>
                        </div>
                        <h3 className="mt-3 font-display font-bold text-lg leading-snug group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-ink/50 leading-relaxed line-clamp-2">{post.excerpt}</p>
                        <div className="mt-5 flex items-center justify-between text-xs text-ink/40">
                          <span>{formatDate(post.date)}</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
