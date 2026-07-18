import { LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SECTIONS, type SectionKey } from "./sections"

interface DashboardSidebarProps {
  active: SectionKey
  onSelect: (key: SectionKey) => void
  onLogout: () => void
  className?: string
}

export function DashboardSidebar({ active, onSelect, onLogout, className }: DashboardSidebarProps) {
  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Account navigation">
      {SECTIONS.map((s) => {
        const isActive = active === s.key
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[14px] font-semibold transition-colors duration-200",
              isActive ? "text-blue-600" : "text-ink/60 hover:text-ink hover:bg-ink/[0.04]"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active-bg"
                className="absolute inset-0 rounded-xl bg-blue-50"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            {isActive && (
              <motion.span
                layoutId="sidebar-active-bar"
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-blue-500"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <s.icon className="relative h-4 w-4 shrink-0" />
            <span className="relative">{s.label}</span>
          </button>
        )
      })}

      <div className="mt-3 border-t border-ink/8 pt-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </nav>
  )
}
