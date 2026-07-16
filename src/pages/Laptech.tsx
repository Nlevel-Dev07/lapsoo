import { useState } from "react"
import { motion } from "framer-motion"
import {
  Monitor, Keyboard, BatteryFull, HardDrive, MemoryStick, CircuitBoard,
  DatabaseBackup, Sparkles, Thermometer, Truck, MessageCircle, Phone, ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { RepairBookingForm } from "@/components/shared/RepairBookingForm"
import { telLink, waLink } from "@/data/site"
import { useSeo } from "@/lib/useSeo"
import { trackRepair, ApiError } from "@/lib/api"

const services = [
  { icon: Monitor, name: "Screen Replacement", desc: "Original & compatible panels for all major brands" },
  { icon: Keyboard, name: "Keyboard Replacement", desc: "Full keyboard assembly replacement, same-day fitting" },
  { icon: BatteryFull, name: "Battery Replacement", desc: "Genuine-grade batteries with 6-month warranty" },
  { icon: HardDrive, name: "SSD Upgrade", desc: "Up to 10x faster boot times, includes data migration" },
  { icon: MemoryStick, name: "RAM Upgrade", desc: "Boost multitasking performance instantly" },
  { icon: CircuitBoard, name: "Motherboard Repair", desc: "Board-level diagnosis for power, charging & display issues" },
  { icon: CircuitBoard, name: "Chip Level Repair", desc: "Advanced micro-soldering for complex hardware faults" },
  { icon: DatabaseBackup, name: "Data Recovery", desc: "Recovery from crashed drives, corrupted partitions" },
  { icon: Sparkles, name: "Deep Cleaning", desc: "Internal cleaning to fix overheating & fan noise" },
  { icon: Thermometer, name: "Thermal Paste Replacement", desc: "Reduce temperatures and fan noise significantly" },
]

const process = [
  { step: "01", title: "Book or Walk In", desc: "Book online, call, or WhatsApp us — or simply walk into any showroom." },
  { step: "02", title: "Free Diagnosis", desc: "Our technicians run a full diagnostic and share transparent pricing before any work begins." },
  { step: "03", title: "Repair", desc: "Most repairs are completed same-day using genuine or OEM-grade parts." },
  { step: "04", title: "Quality Check & Delivery", desc: "Every repair passes a final QC check before pickup or doorstep delivery." },
]

const faqs = [
  { q: "Do you offer pickup and drop service?", a: "Yes — we offer free pickup and drop across Delhi NCR, Bengaluru and Gurugram for most repairs. Charges may apply outside these zones." },
  { q: "How long does a typical repair take?", a: "Screen, battery, RAM and SSD upgrades are usually completed same-day. Motherboard and chip-level repairs may take 2-4 business days depending on parts availability." },
  { q: "Is there a warranty on repairs?", a: "Yes, all repairs come with a warranty ranging from 3 to 6 months depending on the service, covering the part and workmanship." },
  { q: "Can I track my repair status?", a: "Yes, once your device is booked in, you'll receive a tracking ID via SMS/WhatsApp to check live repair status." },
  { q: "Do you use genuine parts?", a: "We use OEM-grade or genuine parts depending on availability and always inform you of the option before starting the repair." },
]

export default function Laptech() {
  useSeo({
    title: "Laptop Repair & Upgrades — LapTech",
    description: "Screen, battery, keyboard, SSD, RAM and motherboard repair with free diagnosis, pickup & drop, and same-day service from LapTech, a Lapsoo brand.",
  })
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const bookMsg = "Hi Lapsoo LapTech, I'd like to book a repair service."

  const [trackCode, setTrackCode] = useState("")
  const [trackResult, setTrackResult] = useState<Awaited<ReturnType<typeof trackRepair>> | null>(null)
  const [trackError, setTrackError] = useState<string | null>(null)
  const [tracking, setTracking] = useState(false)

  const handleTrack = async () => {
    if (!trackCode.trim()) return
    setTracking(true)
    setTrackError(null)
    setTrackResult(null)
    try {
      const result = await trackRepair(trackCode.trim())
      setTrackResult(result)
    } catch (err) {
      setTrackError(err instanceof ApiError ? err.message : "Couldn't fetch status right now.")
    } finally {
      setTracking(false)
    }
  }

  return (
    <div>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-ink/8 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="container-lap grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">LapTech · Repair & Upgrades</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              Expert laptop repair, without the guesswork.
            </h1>
            <p className="mt-4 text-ink/55 max-w-xl leading-relaxed">
              Free diagnosis, transparent pricing, genuine parts, and same-day turnaround for most repairs — with pickup & drop across major cities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book"><Button variant="accent" size="lg">Book Repair</Button></a>
              <a href={waLink(bookMsg)} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" size="lg"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
              </a>
              <a href={telLink()}><Button variant="outline" size="lg"><Phone className="h-4 w-4" /> Call Now</Button></a>
            </div>
          </motion.div>
          <motion.img
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            src="/images/laptech-logo.svg"
            alt="LapTech"
            className="hidden lg:block h-16 w-auto justify-self-end mr-36"
          />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28">
        <div className="container-lap">
          <SectionHeading eyebrow="Services" title="Every repair, handled with genuine parts & care." />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.06 }}
                className="rounded-2xl border border-ink/8 bg-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <s.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="mt-5 font-semibold">{s.name}</h4>
                <p className="mt-2 text-sm text-ink/50 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl bg-[#091739] text-white p-6 flex flex-col justify-center"
            >
              <Truck className="h-6 w-6 text-blue-400" />
              <h4 className="mt-5 font-semibold">Free Pickup & Drop</h4>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">Available across Delhi NCR, Bengaluru & Gurugram for eligible repairs.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28 bg-paper-soft">
        <div className="container-lap">
          <SectionHeading eyebrow="How It Works" title="Our repair process" />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl bg-white border border-ink/8 p-6"
              >
                <span className="font-display text-3xl font-extrabold text-blue-500/25">{p.step}</span>
                <h4 className="mt-3 font-semibold">{p.title}</h4>
                <p className="mt-2 text-sm text-ink/50 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking form + Track repair */}
      <section id="book" className="py-20 md:py-28">
        <div className="container-lap grid lg:grid-cols-2 gap-10">
          <div className="rounded-3xl border border-ink/8 bg-white p-6 sm:p-8">
            <RepairBookingForm />
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#091739] text-white p-8">
              <h3 className="font-display text-xl font-bold">Track Your Repair</h3>
              <p className="mt-2 text-sm text-white/55">Already booked a repair? Enter your tracking ID to check live status.</p>
              <div className="mt-5 flex gap-2">
                <input
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  placeholder="Enter Tracking ID (e.g. LT-20458)"
                  className="flex-1 h-12 rounded-xl bg-white/10 border border-white/15 px-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-blue-400"
                />
                <Button variant="accent" onClick={handleTrack} disabled={tracking}>
                  {tracking ? "Checking..." : "Track"}
                </Button>
              </div>
              {trackError && <p className="mt-3 text-sm text-red-300">{trackError}</p>}
              {trackResult && (
                <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm">
                  <p className="font-semibold">{trackResult.device} · {trackResult.issueType}</p>
                  <p className="mt-1 text-white/60">
                    Status: <span className="font-semibold text-white">{trackResult.status.replace(/_/g, " ")}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-ink/8 bg-white p-8">
              <h3 className="font-display text-lg font-bold">FAQs</h3>
              <div className="mt-4 divide-y divide-ink/8">
                {faqs.map((f, i) => (
                  <div key={f.q} className="py-3">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between text-left gap-4"
                    >
                      <span className="text-sm font-semibold">{f.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && <p className="mt-2 text-sm text-ink/50 leading-relaxed">{f.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
