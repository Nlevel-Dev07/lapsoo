import { motion } from "framer-motion"
import { Target, Eye, ShieldCheck, Users, Award, Handshake } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { CTAGroup } from "@/components/shared/CTAGroup"
import { useSeo } from "@/lib/useSeo"

const milestones = [
  { year: "1990s", event: "Our journey began in Gurgaon with a single computer & electronics store." },
  { year: "2000s", event: "Expanded into corporate IT procurement as Gurgaon's business hubs grew." },
  { year: "2010s", event: "Became an authorized partner for Dell, Lenovo, ASUS, Acer, HP & Apple." },
  { year: "2020s", event: "Grew to 8 stores across Gurgaon, serving businesses, institutions & enterprises." },
  { year: "2026", event: "Lapsoo launched — bringing our 30+ years of trust to a smart digital ecosystem." },
]

const trustFactors = [
  { icon: Award, title: "30+ Years Experience", desc: "Three decades of trusted technology service across Gurgaon and NCR." },
  { icon: Handshake, title: "Corporate Procurement Expertise", desc: "Bulk deployment, hardware standardization and enterprise support." },
  { icon: ShieldCheck, title: "Authorized Brand Partner", desc: "Official channel for Dell, Lenovo, ASUS, Acer, HP & Apple." },
  { icon: ShieldCheck, title: "Genuine Products", desc: "100% genuine devices backed by manufacturer warranty." },
  { icon: Users, title: "Dedicated Customer Support", desc: "A dedicated account manager for every business relationship." },
]

const stats = [
  { value: "30+", label: "Years of Industry Excellence" },
  { value: "8", label: "Stores Across Gurgaon" },
  { value: "6", label: "Authorized Brand Partnerships" },
  { value: "100%", label: "Genuine Products" },
]

const partnerBrands = ["Dell", "Lenovo", "ASUS", "Acer", "HP", "Apple"]

export default function About() {
  useSeo({
    title: "About Us",
    description: "Lapsoo is India's smart laptop ecosystem — learn our story, mission, and why thousands of customers and businesses trust us for new laptops, refurbished devices, and repair.",
  })

  return (
    <div>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-ink/8">
        <div className="container-lap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">About Lapsoo</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              30+ Years of Industry Excellence
            </h1>
            <p className="mt-4 text-ink/55 max-w-2xl leading-relaxed">
              For over three decades, Lapsoo has been a trusted technology partner serving businesses, professionals, educational institutions, and corporate organizations across Gurgaon and NCR. With a strong presence through 8 stores across Gurgaon, we provide reliable access to genuine technology products, business computing solutions, and enterprise procurement services. As a trusted technology provider, we help organizations simplify procurement, upgrades, repairs, and business computing requirements through professional consultation and dependable support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-b border-ink/8">
        <div className="container-lap grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-display text-3xl md:text-4xl font-extrabold text-ink">{s.value}</div>
              <div className="mt-1 text-sm text-ink/50">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Factors */}
      <section className="py-20 md:py-28">
        <div className="container-lap">
          <SectionHeading eyebrow="Trust Factors" title="Why businesses choose Lapsoo" />
          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {trustFactors.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl bg-white border border-ink/8 p-7"
              >
                <v.icon className="h-7 w-7 text-blue-500" />
                <h4 className="mt-5 font-semibold text-lg">{v.title}</h4>
                <p className="mt-2 text-sm text-ink/55 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 Stores Across Gurgaon */}
      <section className="py-20 md:py-28 bg-paper-soft">
        <div className="container-lap">
          <SectionHeading eyebrow="Our Presence" title="8 Stores Across Gurgaon" description="A strong retail and service footprint across Gurgaon, built over 30+ years to stay close to the businesses and customers we serve." />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-10 rounded-3xl overflow-hidden border border-ink/8 aspect-[21/9]"
          >
            <img src="/images/gurgaon-stores.jpg" alt="Lapsoo stores across Gurgaon skyline" className="h-full w-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* Authorized Partner */}
      <section className="py-20 md:py-28">
        <div className="container-lap">
          <SectionHeading eyebrow="Authorized Partner" title="Authorized partner of leading laptop & IT brands" description="100% genuine products, manufacturer warranty, corporate pricing, and bulk procurement — backed by official brand partnerships." />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-10 rounded-3xl overflow-hidden border border-ink/8 aspect-[4/3] md:aspect-[16/9]"
          >
            <img src="/images/authorized-partner.jpg" alt="Lapsoo authorized partner laptops" className="h-full w-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
          >
            {partnerBrands.map((brand) => (
              <span key={brand} className="font-display text-xl md:text-2xl font-extrabold text-ink/70">
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-20 md:py-28">
        <div className="container-lap grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-3xl border border-ink/8 bg-white p-8">
            <Target className="h-8 w-8 text-blue-500" />
            <h3 className="mt-5 font-display text-2xl font-bold">Our Mission</h3>
            <p className="mt-3 text-ink/55 leading-relaxed">
              To make quality laptops accessible to every Indian — student, professional, or enterprise — through honest grading, fair pricing, and dependable after-sales support.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-3xl border border-ink/8 bg-white p-8">
            <Eye className="h-8 w-8 text-blue-500" />
            <h3 className="mt-5 font-display text-2xl font-bold">Our Vision</h3>
            <p className="mt-3 text-ink/55 leading-relaxed">
              To become India's most trusted laptop ecosystem — the first name that comes to mind whether you're buying, upgrading, or repairing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-paper-soft">
        <div className="container-lap">
          <SectionHeading eyebrow="Our Journey" title="30+ years of growth across Gurgaon" />
          <div className="mt-14 max-w-2xl mx-auto">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-6 pb-10 last:pb-0 relative"
              >
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
                  {i !== milestones.length - 1 && <div className="w-px flex-1 bg-ink/10 mt-2" />}
                </div>
                <div className="-mt-1.5">
                  <span className="font-display text-lg font-bold text-blue-600">{m.year}</span>
                  <p className="mt-1 text-ink/60 text-sm leading-relaxed">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-20 md:py-28 border-t border-ink/8">
        <div className="container-lap text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto" />
          <SectionHeading title="Meet the team behind the trust" align="center" className="mt-5" description="Dedicated account managers, product specialists, and technicians — all trained to put honesty first." />
          <CTAGroup className="mt-10 flex justify-center [&>div]:justify-center" />
        </div>
      </section>
    </div>
  )
}
