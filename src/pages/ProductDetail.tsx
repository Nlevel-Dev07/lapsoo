import { useParams, Link, Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ChevronRight, MessageCircle, Phone, MapPin, Check, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LaptopMock } from "@/components/shared/LaptopMock"
import { ProductCard } from "@/components/shared/ProductCard"
import { LeadForm } from "@/components/shared/LeadForm"
import { formatPrice } from "@/data/products"
import { SITE, telLink, waLink } from "@/data/site"
import { useSeo } from "@/lib/useSeo"
import { fetchProductBySlug, fetchProducts } from "@/lib/api"
import { productGradient } from "@/lib/gradient"

export default function ProductDetail() {
  const { slug } = useParams()

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug as string),
    enabled: Boolean(slug),
    retry: false,
  })

  const { data: allProducts } = useQuery({
    queryKey: ["products", product?.ecosystem],
    queryFn: () => fetchProducts({ ecosystem: product?.ecosystem }),
    enabled: Boolean(product),
  })

  useSeo({
    title: product ? `${product.brand} ${product.model}` : "Product",
    description: product
      ? `${product.brand} ${product.model} — ${product.processor}, ${product.ram}, ${product.storage}. ${product.condition}. Get a quote from Lapsoo.`
      : "Product details",
  })

  if (isLoading) {
    return <div className="container-lap py-32 text-center text-ink/45">Loading product…</div>
  }

  if (isError || !product) return <Navigate to="/lapandtop" replace />

  const related = (allProducts ?? []).filter((p) => p.slug !== product.slug).slice(0, 4)
  const gradient = product.gradientFrom && product.gradientTo
    ? { from: product.gradientFrom, to: product.gradientTo }
    : productGradient(product.slug)

  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model },
    { label: "Processor", value: product.processor },
    { label: "RAM", value: product.ram },
    { label: "Storage", value: product.storage },
    { label: "Display", value: product.display },
    { label: "Graphics", value: product.graphics },
    { label: "Battery", value: product.battery },
    { label: "Warranty", value: product.warranty },
    { label: "Condition", value: product.condition },
  ]

  const catalogPath = product.ecosystem === "lapandtop" ? "/lapandtop" : "/laptopbazaar"
  const catalogName = product.ecosystem === "lapandtop" ? "LapAndTop" : "LaptopBazaar"
  const waMsg = `Hi Lapsoo, I'm interested in the ${product.brand} ${product.model}. Could you share more details?`

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="container-lap pt-8">
        <nav className="flex items-center gap-1.5 text-sm text-ink/45">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={catalogPath} className="hover:text-ink">{catalogName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink/70">{product.brand} {product.model}</span>
        </nav>
      </div>

      <section className="container-lap mt-8 grid lg:grid-cols-2 gap-14">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="rounded-3xl bg-paper-soft border border-ink/8 sticky top-24">
            <LaptopMock glyph={product.brand[0]} from={gradient.from} to={gradient.to} className="p-12" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="flex items-center gap-2">
            <Badge variant={product.condition === "New" ? "success" : "blue"}>{product.condition}</Badge>
            <Badge variant="outline">{product.availability}</Badge>
          </div>
          <h1 className="font-display mt-4 text-[32px] md:text-[40px] font-extrabold tracking-tight leading-tight">
            {product.brand} {product.model}
          </h1>
          <p className="mt-2 text-ink/50">{product.category} · {product.screenSize}" Display</p>

          <p className="mt-6 font-display text-3xl font-bold">
            {formatPrice(product.priceFrom)} <span className="text-sm font-medium text-ink/40">onwards</span>
          </p>
          <p className="mt-1 text-sm text-ink/45">Final price confirmed on quote based on configuration & stock.</p>

          <div className="mt-8 space-y-2.5">
            {product.highlights.map((h) => (
              <div key={h} className="flex items-center gap-2.5 text-sm text-ink/70">
                <Check className="h-4 w-4 text-blue-500 shrink-0" /> {h}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact">
              <Button variant="accent" size="lg">Get Quote</Button>
            </Link>
            <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer">
              <Button variant="whatsapp" size="lg"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
            </a>
            <a href={telLink()}>
              <Button variant="outline" size="lg"><Phone className="h-4 w-4" /> Call Now</Button>
            </a>
            <Link to="/contact">
              <Button variant="ghost" size="lg"><MapPin className="h-4 w-4" /> Visit Showroom</Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2.5 rounded-2xl bg-blue-50 text-blue-700 px-4 py-3 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 shrink-0" /> {product.warranty} · Free consultation before purchase
          </div>
        </motion.div>
      </section>

      {/* Specs table */}
      <section className="container-lap mt-20">
        <h2 className="font-display text-2xl font-bold">Full Specifications</h2>
        <div className="mt-6 rounded-3xl border border-ink/8 overflow-hidden">
          {specs.map((s, i) => (
            <div
              key={s.label}
              className={`grid grid-cols-2 px-6 py-4 text-sm ${i % 2 === 0 ? "bg-paper-soft" : "bg-white"}`}
            >
              <span className="font-semibold text-ink/60">{s.label}</span>
              <span className="text-ink">{s.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry form */}
      <section className="container-lap mt-20 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-2xl font-bold">Request a Quote</h2>
          <p className="mt-2 text-ink/55 text-sm max-w-md">
            Share your details and our product specialist will call you back with the best available configuration and price for the {product.brand} {product.model}.
          </p>
          <div className="mt-8 rounded-3xl border border-ink/8 bg-white p-6 sm:p-8">
            <LeadForm
              formName={`Product Enquiry - ${product.brand} ${product.model}`}
              submitLabel="Get Quote"
              source="PRODUCT_ENQUIRY"
              productId={product.id}
            />
          </div>
        </div>
        <div className="rounded-3xl bg-[#091739] text-white p-8 sm:p-10 h-fit">
          <h3 className="font-display text-xl font-bold">Prefer to talk directly?</h3>
          <p className="mt-2 text-white/55 text-sm">Our specialists are available {SITE.hours}.</p>
          <div className="mt-6 space-y-3">
            <a href={telLink()} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 transition-colors">
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
            <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-[#25D366]/15 text-[#25D366] px-4 py-3 text-sm font-semibold hover:bg-[#25D366]/25 transition-colors">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="container-lap mt-20">
          <h2 className="font-display text-2xl font-bold">You may also like</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p, i) => (
              <ProductCard key={p.slug} p={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
