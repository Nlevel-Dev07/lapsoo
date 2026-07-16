import { motion } from "framer-motion"
import { Building2, FileText, UserCheck, Rocket, Landmark, GraduationCap, MessageCircle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { CorporateLeadForm } from "@/components/shared/CorporateLeadForm"
import { telLink, waLink } from "@/data/site"
import { useSeo } from "@/lib/useSeo"

const offerings = [
  { icon: Building2, title: "Corporate Procurement", desc: "End-to-end laptop sourcing for your organization, from spec finalization to delivery." },
  { icon: FileText, title: "Bulk Orders & GST Billing", desc: "Volume pricing with fully compliant GST invoicing for seamless accounting." },
  { icon: UserCheck, title: "Dedicated Account Manager", desc: "A single point of contact for orders, support, and post-purchase service." },
  { icon: Rocket, title: "Startup Packages", desc: "Curated laptop bundles for growing teams, with flexible payment terms." },
  { icon: Building2, title: "Office Setup", desc: "Complete office IT hardware setup including laptops, peripherals, and imaging." },
  { icon: GraduationCap, title: "Educational Institutes", desc: "Special pricing and support for schools, colleges, and training institutes." },
  { icon: Landmark, title: "Government Supply", desc: "Empanelled process support for government and PSU procurement requirements." },
]

const stats = [
  { value: "500+", label: "Businesses Served" },
  { value: "25,000+", label: "Devices Deployed" },
  { value: "48 Hrs", label: "Avg. Delivery (Metro)" },
  { value: "12+", label: "Cities Covered" },
]

export default function Corporate() {
  useSeo({
    title: "Corporate Laptop Solutions",
    description: "Bulk laptop procurement, GST billing, dedicated account managers, and startup packages for businesses, institutions, and government supply — from Lapsoo.",
  })
  const waMsg = "Hi Lapsoo, I'd like to discuss a corporate laptop procurement requirement."

  return (
    <div>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-ink/8 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="container-lap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">Corporate & Institutional</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              Equip your organization with a partner that scales with you.
            </h1>
            <p className="mt-4 text-ink/55 max-w-xl leading-relaxed">
              From 10-seat startups to 1,000-seat enterprises, Lapsoo's Corporate Solutions team manages procurement, billing, and after-sales support so your IT team doesn't have to.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#enquiry"><Button variant="accent" size="lg">Corporate Enquiry</Button></a>
              <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" size="lg"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
              </a>
              <a href={telLink()}><Button variant="outline" size="lg"><Phone className="h-4 w-4" /> Call Now</Button></a>
            </div>
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

      {/* Offerings */}
      <section className="py-20 md:py-28">
        <div className="container-lap">
          <SectionHeading eyebrow="What We Offer" title="Enterprise-grade laptop solutions" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offerings.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
                className="rounded-2xl border border-ink/8 bg-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <o.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="mt-5 font-semibold">{o.title}</h4>
                <p className="mt-2 text-sm text-ink/50 leading-relaxed">{o.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section id="enquiry" className="py-20 md:py-28 bg-[#091739] text-white">
        <div className="container-lap grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeading eyebrow="Get Started" title="Talk to our corporate team" dark className="max-w-lg" />
            <p className="mt-6 text-white/55 text-sm leading-relaxed max-w-md">
              Share your requirement below — device count, brand preference, and timeline — and a dedicated account manager will respond within one business day.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 sm:p-8">
            <CorporateLeadForm />
          </div>
        </div>
      </section>
    </div>
  )
}
