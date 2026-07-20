import { useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  LayoutDashboard, Laptop, Newspaper, Inbox, Wrench, Wallet, RefreshCw,
  Users, UserCog, Settings, LogOut, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { adminLogout } from "@/lib/api"
import { useAdminAuth } from "./useAdminAuth"
import { ToastProvider } from "./components/Toast"
import { ConfirmProvider } from "./components/ConfirmDialog"

// `key: null` items are always visible regardless of a team session's menuKeys.
export const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, key: null, section: null },
  { to: "/admin/products", label: "Products", icon: Laptop, key: "products", section: "Catalog" },
  { to: "/admin/blog", label: "Blog", icon: Newspaper, key: "blog", section: "Catalog" },
  { to: "/admin/leads", label: "Leads", icon: Inbox, key: "leads", section: "Activity" },
  { to: "/admin/repair", label: "Repair", icon: Wrench, key: "repair", section: "Activity" },
  { to: "/admin/sell", label: "Sell", icon: Wallet, key: "sell", section: "Activity" },
  { to: "/admin/exchange", label: "Exchange", icon: RefreshCw, key: "exchange", section: "Activity" },
  { to: "/admin/customers", label: "Customers", icon: Users, key: "customers", section: "People" },
  { to: "/admin/team", label: "Teams", icon: UserCog, key: "teams", section: "People" },
  { to: "/admin/settings", label: "Settings", icon: Settings, key: null, section: null },
] as const

const SECTION_ORDER = ["Catalog", "Activity", "People"] as const

function initials(name?: string) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { session, invalidate } = useAdminAuth()
  const visibleNav = nav.filter((item) => item.key === null || !session?.menuKeys || session.menuKeys.includes(item.key))

  const handleLogout = async () => {
    await adminLogout()
    invalidate()
    navigate("/admin/login")
  }

  const topLevel = visibleNav.filter((i) => i.section === null && i.to === "/admin")
  const bottomLevel = visibleNav.filter((i) => i.section === null && i.to !== "/admin")

  const renderLink = (item: (typeof nav)[number]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={"end" in item ? item.end : undefined}
      onClick={onNavigate}
      className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="admin-nav-active"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-blue-500/15"
            />
          )}
          <item.icon className={cn("relative h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-white/50")} />
          <span className={cn("relative", isActive ? "text-white" : "text-white/60")}>{item.label}</span>
        </>
      )}
    </NavLink>
  )

  return (
    <>
      <div className="h-20 flex items-center px-6 border-b border-white/10 shrink-0">
        <span className="font-display text-xl font-extrabold tracking-tight text-white">Lapsoo</span>
        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {topLevel.map(renderLink)}
        {SECTION_ORDER.map((section) => {
          const items = visibleNav.filter((i) => i.section === section)
          if (items.length === 0) return null
          return (
            <div key={section} className="pt-4">
              <p className="px-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">{section}</p>
              {items.map(renderLink)}
            </div>
          )
        })}
        <div className="pt-4">{bottomLevel.map(renderLink)}</div>
      </nav>
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
            {initials(session?.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white/85">{session?.name}</div>
            <div className="truncate text-[11px] text-white/35">{session?.role ?? "Admin"}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </div>
    </>
  )
}

function AdminLayoutInner() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen flex bg-paper-soft">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-ink text-white flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-ink text-white lg:hidden"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 flex items-center gap-3 border-b border-ink/8 bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 rounded-lg hover:bg-ink/5"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-display text-lg font-bold">Lapsoo Admin</span>
        </header>
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export function AdminLayout() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminLayoutInner />
      </ConfirmProvider>
    </ToastProvider>
  )
}
