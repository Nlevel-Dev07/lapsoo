import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Truck, Award, Users, Wrench, RefreshCw, Sparkles, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CTAGroup } from "@/components/shared/CTAGroup"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { ProductCard } from "@/components/shared/ProductCard"
import { useSeo } from "@/lib/useSeo"
import { fetchProducts } from "@/lib/api"
import { waLink } from "@/data/site"

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
}

const ecosystems = [
  {
    name: "LapAndTop",
    tag: "Certified Refurbished Laptops",
    desc: "Business, student, gaming & workstation laptops — professionally graded, tested, and warrantied.",
    to: "/lapandtop",
    cta: "Explore",
    icon: RefreshCw,
    from: "#2f5eff",
    to2: "#0b0c10",
    logo: "/images/lapandtop-logo-black.png",
  },
  {
    name: "LaptopBazaar",
    tag: "Brand New Laptops",
    desc: "Authorized partner for HP, Dell, Lenovo, ASUS, Acer & Apple — sealed box, full warranty.",
    to: "/laptopbazaar",
    cta: "Explore",
    icon: Sparkles,
    from: "#1e46e0",
    to2: "#121319",
    logo: "/images/laptopbazaar-logo.png",
  },
  {
    name: "LapTech",
    tag: "Repair & Upgrade",
    desc: "Screen, battery, keyboard, SSD & motherboard repair with pickup & drop and same-day service.",
    to: "/laptech",
    cta: "Book Service",
    icon: Wrench,
    from: "#0d7a5f",
    to2: "#0b0c10",
    // TODO: swap for the real LapTech logo file once provided.
    logo: "/images/laptech-logo.svg",
  },
]

const brandLogos = [
  { name: "Dell", src: "/images/brands/dell-logo.png" },
  { name: "Lenovo", src: "/images/brands/lenovo-logo.png" },
  { name: "ASUS", src: "/images/brands/asus-logo.png" },
  { name: "Acer", src: "/images/brands/acer-logo.png" },
  { name: "Apple", src: "/images/brands/apple-logo.png" },
  { name: "HP", src: "/images/brands/hp-logo.png" },
]

const trust = [
  { icon: ShieldCheck, label: "120-Point Quality Check", desc: "Every refurbished unit is fully diagnosed and certified" },
  { icon: Award, label: "Authorized Brand Partner", desc: "Official channel for 6 leading laptop manufacturers" },
  { icon: Truck, label: "Pickup & Drop Service", desc: "Doorstep repair pickup across major cities" },
  { icon: Users, label: "15,000+ Happy Customers", desc: "Trusted by individuals, students & enterprises" },
]

export default function Home() {
  useSeo({
    title: "India's Smart Laptop Ecosystem",
    description:
      "Lapsoo is India's smart laptop ecosystem — new laptops, certified refurbished devices, and expert repair & upgrades, all under one trusted brand.",
  })

  const { data: allProducts } = useQuery({ queryKey: ["products", "all"], queryFn: () => fetchProducts() })
  const featured = (allProducts ?? []).slice(0, 4)

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/60 via-white to-white" />
        <div
          className="absolute -top-40 right-[-10%] -z-10 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #2f5eff, transparent 70%)" }}
        />
        <div className="container-lap">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Badge variant="blue">India's Smart Laptop Ecosystem</Badge>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display mt-6 text-[42px] sm:text-[56px] lg:text-[64px] font-extrabold tracking-tight leading-[1.02] text-balance"
              >
                One ecosystem for every laptop need.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 text-lg text-ink/55 leading-relaxed max-w-xl"
              >
                Buy new laptops. Buy certified refurbished. Repair & upgrade. Lapsoo brings together LapAndTop, LaptopBazaar, and LapTech — everything under one trusted ecosystem.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-wrap gap-3"
              >
                <Link to="/lapandtop">
                  <Button variant="accent" size="lg">
                    Explore Products <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/corporate">
                  <Button variant="outline" size="lg">
                    Corporate Solutions
                  </Button>
                </Link>
                <a href={waLink("Hi Lapsoo, I have a question.")} target="_blank" rel="noopener noreferrer">
                  <Button variant="whatsapp" size="lg">
                    WhatsApp Us
                  </Button>
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink/45"
              >
                <span>7 Stores Across Gurgaon</span>
                <span className="h-1 w-1 rounded-full bg-ink/20" />
                <span>30+ Years of Industry Excellence</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <img
                src="/images/lapsoo-overview.png"
                alt="Lapsoo ecosystem overview"
                className="max-w-md mx-auto rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* BRAND LOGOS */}
      <section className="py-14 border-y border-ink/8">
        <div className="container-lap">
          <p className="text-center text-[13px] font-semibold uppercase tracking-wide text-ink/40">
            Authorized partner for leading laptop brands
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            {brandLogos.map((b, i) => (
              <motion.img
                key={b.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                src={b.src}
                alt={b.name}
                className="h-11 md:h-14 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* THREE ECOSYSTEM CARDS */}
      <section className="py-20 md:py-28">
        <div className="container-lap">
          <SectionHeading
            eyebrow="The Ecosystem"
            title="Three specialised vertices. One trusted promise."
            description="Whichever stage of the laptop lifecycle you're in, Lapsoo has a dedicated team built for it."
          />
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {ecosystems.map((eco, i) => (
              <motion.div
                key={eco.name}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={eco.to}
                  className="group block h-full rounded-3xl border border-ink/8 bg-white p-8 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500"
                >
                  {"logo" in eco && eco.logo ? (
                    <img src={eco.logo} alt={eco.name} className="h-10 w-auto mb-8" />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl mb-8"
                      style={{ background: `linear-gradient(135deg, ${eco.from}, ${eco.to2})` }}
                    >
                      <eco.icon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {!("logo" in eco && eco.logo) && (
                    <h3 className="font-display text-2xl font-bold tracking-tight">{eco.name}</h3>
                  )}
                  <p className="mt-1 text-[13px] font-semibold text-blue-500 uppercase tracking-wide">{eco.tag}</p>
                  <p className="mt-4 text-[15px] text-ink/55 leading-relaxed">{eco.desc}</p>
                  <div className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-ink group-hover:gap-2.5 transition-all">
                    {eco.cta} <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-20 md:py-28 bg-[#091739] text-white">
        <div className="container-lap">
          <SectionHeading
            eyebrow="Why Lapsoo"
            title="Built for trust, not just transactions."
            description="15,000+ customers across India rely on Lapsoo for honest grading, transparent pricing, and real after-sales support."
            dark
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trust.map((t, i) => (
              <motion.div
                key={t.label}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <t.icon className="h-6 w-6 text-blue-400" />
                <h4 className="mt-5 font-semibold text-white">{t.label}</h4>
                <p className="mt-2 text-sm text-white/45 leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 md:py-28">
        <div className="container-lap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Featured" title="Popular right now" className="mb-0" />
            <Link to="/lapandtop" className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:gap-2.5 transition-all">
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p, i) => (
              <ProductCard key={p.slug} p={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CORPORATE STRIP */}
      <section className="py-20 md:py-28">
        <div className="container-lap">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-blue-600 to-blue-700 p-10 md:p-16 text-white"
          >
            <div className="absolute -right-20 -bottom-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 mb-6">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="font-display text-3xl md:text-[38px] font-extrabold tracking-tight leading-tight">
                  Equipping your team, at scale.
                </h3>
                <p className="mt-4 text-white/70 max-w-md leading-relaxed">
                  Bulk procurement, GST billing, dedicated account managers, and startup packages — built for businesses, institutions, and government supply.
                </p>
                <Link to="/corporate">
                  <Button variant="inverse" size="lg" className="mt-8">
                    Corporate Enquiry <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {["Bulk Orders", "GST Billing", "Account Manager", "Govt. Supply"].map((f) => (
                  <div key={f} className="rounded-2xl bg-white/10 p-5 text-sm font-semibold">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28 border-t border-ink/8">
        <div className="container-lap text-center">
          <SectionHeading
            title="Ready to find your next laptop?"
            description="Talk to our team — no pressure, no checkout, just honest advice."
            align="center"
          />
          <CTAGroup className="mt-10 flex justify-center [&>div]:justify-center" />
        </div>
      </section>
    </div>
  )
}
