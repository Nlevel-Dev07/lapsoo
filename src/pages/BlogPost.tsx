import { useParams, Link, Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ChevronRight, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CTAGroup } from "@/components/shared/CTAGroup"
import { formatDate } from "@/data/blog"
import { useSeo } from "@/lib/useSeo"
import { fetchBlogPostById, fetchBlogPosts } from "@/lib/api"
import { productGradient } from "@/lib/gradient"

export default function BlogPost() {
  const { slug } = useParams()

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog", slug],
    queryFn: () => fetchBlogPostById(slug as string),
    enabled: Boolean(slug),
    retry: false,
  })

  const { data: allPosts } = useQuery({ queryKey: ["blog"], queryFn: fetchBlogPosts })

  useSeo({
    title: post ? post.title : "Blog",
    description: post ? post.excerpt : "Lapsoo blog article",
  })

  if (isLoading) {
    return <div className="container-lap py-32 text-center text-ink/45">Loading article…</div>
  }

  if (isError || !post) return <Navigate to="/blog" replace />

  const related = (allPosts ?? []).filter((p) => p.slug !== post.slug).slice(0, 3)
  const gradient = post.gradientFrom && post.gradientTo
    ? { from: post.gradientFrom, to: post.gradientTo }
    : productGradient(post.slug)

  return (
    <article className="pb-24">
      <div className="container-lap pt-8">
        <nav className="flex items-center gap-1.5 text-sm text-ink/45">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/blog" className="hover:text-ink">Blog</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink/70 truncate max-w-[200px]">{post.title}</span>
        </nav>
      </div>

      <div className="container-lap mt-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge variant="blue">{post.category}</Badge>
          <h1 className="font-display mt-5 text-[30px] md:text-[42px] font-extrabold tracking-tight leading-[1.1] text-balance">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-ink/45">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </motion.div>

        {post.coverImage ? (
          <div className="mt-10 aspect-[16/8] rounded-3xl overflow-hidden">
            <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="mt-10 aspect-[16/8] rounded-3xl"
            style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
          />
        )}

        <div className="mt-10 space-y-6">
          {post.content.map((para, i) => (
            <p key={i} className="text-[17px] leading-relaxed text-ink/70">{para}</p>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-paper-soft border border-ink/8 p-8 text-center">
          <h3 className="font-display text-xl font-bold">Still deciding? Talk to a specialist.</h3>
          <p className="mt-2 text-sm text-ink/55">Get personalised advice — no pressure, just honest guidance.</p>
          <CTAGroup className="mt-6 flex justify-center [&>div]:justify-center" />
        </div>
      </div>

      {related.length > 0 && (
        <div className="container-lap mt-20">
          <h2 className="font-display text-2xl font-bold">More from the blog</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {related.map((p) => {
              const g = p.gradientFrom && p.gradientTo ? { from: p.gradientFrom, to: p.gradientTo } : productGradient(p.slug)
              return (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group block rounded-2xl border border-ink/8 bg-white overflow-hidden hover:shadow-lg transition-shadow">
                  {p.coverImage ? (
                    <div className="aspect-[16/9]">
                      <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9]" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />
                  )}
                  <div className="p-5">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{p.category}</p>
                    <h4 className="mt-2 font-semibold text-sm leading-snug group-hover:text-blue-600 transition-colors">{p.title}</h4>
                    <div className="mt-3 flex items-center gap-1 text-xs text-ink/40">
                      Read more <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </article>
  )
}
