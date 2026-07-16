import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LeadForm } from "@/components/shared/LeadForm"
import { SITE, telLink, waLink } from "@/data/site"
import { useSeo } from "@/lib/useSeo"

export default function Contact() {
  useSeo({
    title: "Contact Us",
    description: "Get in touch with Lapsoo — showroom locations, phone numbers, WhatsApp, and email. Visit us or send an enquiry and our team will respond within 24 hours.",
  })

  return (
    <div>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-ink/8">
        <div className="container-lap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">Contact</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              Let's talk laptops.
            </h1>
            <p className="mt-4 text-ink/55 max-w-xl leading-relaxed">
              Visit a showroom, call us, or send an enquiry — whichever works best for you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-lap grid lg:grid-cols-2 gap-12">
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <a href={telLink()} className="rounded-2xl border border-ink/8 bg-white p-5 hover:shadow-lg transition-shadow">
                <Phone className="h-5 w-5 text-blue-500" />
                <p className="mt-3 text-sm font-semibold">{SITE.phone}</p>
                <p className="text-xs text-ink/45">Call our support line</p>
              </a>
              <a href={waLink("Hi Lapsoo, I have a question.")} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-ink/8 bg-white p-5 hover:shadow-lg transition-shadow">
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                <p className="mt-3 text-sm font-semibold">WhatsApp Us</p>
                <p className="text-xs text-ink/45">Fastest response time</p>
              </a>
              <a href={`mailto:${SITE.email}`} className="rounded-2xl border border-ink/8 bg-white p-5 hover:shadow-lg transition-shadow">
                <Mail className="h-5 w-5 text-blue-500" />
                <p className="mt-3 text-sm font-semibold">{SITE.email}</p>
                <p className="text-xs text-ink/45">General enquiries</p>
              </a>
              <div className="rounded-2xl border border-ink/8 bg-white p-5">
                <Clock className="h-5 w-5 text-blue-500" />
                <p className="mt-3 text-sm font-semibold">{SITE.hours}</p>
                <p className="text-xs text-ink/45">Business hours</p>
              </div>
            </div>

            <h3 className="font-display text-xl font-bold mb-4">Our 7 Stores Across Gurgaon</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {SITE.addresses.map((a) => (
                <div key={a.city} className="rounded-2xl border border-ink/8 bg-white p-5 flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{a.city}</p>
                    <p className="text-sm text-ink/50 mt-0.5">{a.line}</p>
                    <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="text-sm text-blue-600 font-medium mt-1 inline-block">{a.phone}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-ink/8 bg-white p-6 sm:p-8 h-fit">
            <LeadForm
              title="Send us an enquiry"
              description="Fill in your details and our team will get back to you within 24 hours."
              formName="General Enquiry"
              submitLabel="Send Enquiry"
              source="GENERAL_ENQUIRY"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
