import { motion } from "framer-motion"
import { Package, LifeBuoy, type LucideIcon } from "lucide-react"
import type { SectionKey } from "./sections"

interface QuickAction {
  key: SectionKey
  label: string
  value: number
  icon: LucideIcon
}

interface QuickActionsProps {
  orders: number
  openTickets: number
  onSelect: (key: SectionKey) => void
}

export function QuickActions({ orders, openTickets, onSelect }: QuickActionsProps) {
  const actions: QuickAction[] = [
    { key: "orders", label: "Orders", value: orders, icon: Package },
    { key: "support", label: "Open Repairs", value: openTickets, icon: LifeBuoy },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((a, i) => (
        <motion.button
          key={a.key}
          onClick={() => onSelect(a.key)}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-ink/8 bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow duration-300 hover:shadow-lg"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-500 group-hover:text-white">
            <a.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-extrabold">{a.value}</p>
            <p className="text-sm text-ink/45">{a.label}</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
