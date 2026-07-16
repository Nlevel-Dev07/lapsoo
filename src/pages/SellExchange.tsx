import { motion } from "framer-motion"
import { Wallet, RefreshCw, ShieldCheck, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { SellExchangeForm } from "@/components/shared/SellExchangeForm"
import { useSeo } from "@/lib/useSeo"

const steps = [
  { icon: Clock, title: "Get an Instant Estimate", desc: "Share your laptop's details and get a fair price estimate within minutes." },
  { icon: ShieldCheck, title: "Free Inspection", desc: "Our team inspects the device at your doorstep or showroom, no obligation." },
  { icon: Wallet, title: "Get Paid or Exchange", desc: "Accept the final offer for instant payment, or apply it towards a new/refurbished laptop." },
]

export default function SellExchange() {
  useSeo({
    title: "Sell or Exchange Your Laptop",
    description: "Get a fair price for your old laptop. Sell it outright or exchange it towards a new or certified refurbished laptop from Lapsoo.",
  })

  return (
    <div>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-ink/8 bg-gradient-to-b from-blue-50/60 to-white">
        <div className="container-lap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="blue">Sell / Exchange</Badge>
            <h1 className="font-display mt-5 text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.05] text-balance max-w-2xl">
              Turn your old laptop into your next one.
            </h1>
            <p className="mt-4 text-ink/55 max-w-xl leading-relaxed">
              Get a fair, transparent valuation for your current laptop — sell it for cash or exchange it towards any new or certified refurbished device.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-lap">
          <SectionHeading eyebrow="How It Works" title="Sell or exchange in 3 simple steps" />
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-ink/8 bg-white p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <s.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="mt-5 font-semibold">{s.title}</h4>
                <p className="mt-2 text-sm text-ink/50 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-paper-soft">
        <div className="container-lap grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold">Why sell or exchange with Lapsoo?</h3>
            <ul className="mt-5 space-y-3 text-sm text-ink/60">
              <li>• Transparent valuation based on condition, age, and configuration</li>
              <li>• Free doorstep pickup for inspection in major cities</li>
              <li>• Exchange bonus applied instantly towards new or refurbished purchase</li>
              <li>• Secure data wipe certified before resale</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-ink/8 bg-white p-6 sm:p-8">
            <SellExchangeForm />
          </div>
        </div>
      </section>
    </div>
  )
}
