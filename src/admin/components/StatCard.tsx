import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function useCountUp(value: number, active: boolean) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active) return
    let raf: number
    const duration = 600
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, active])

  return display
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: LucideIcon
  label: string
  value: number
  sub?: string
  accent?: boolean
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const display = useCountUp(value, inView)

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-2xl border p-6 transition-shadow hover:shadow-lg hover:shadow-ink/[0.04]",
        accent ? "border-blue-200 bg-blue-50" : "border-ink/8 bg-white"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          accent ? "bg-blue-500/15" : "bg-ink/[0.05]"
        )}
      >
        <Icon className={cn("h-5 w-5", accent ? "text-blue-600" : "text-ink/45")} />
      </div>
      <p className="mt-4 font-display text-3xl font-extrabold tabular-nums">{display}</p>
      <p className="mt-1 text-sm text-ink/50">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/35">{sub}</p>}
    </motion.div>
  )
}
