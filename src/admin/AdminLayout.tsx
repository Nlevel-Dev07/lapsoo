import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Laptop, Newspaper, Inbox, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminLogout } from "@/lib/api"
import { useAdminAuth } from "./useAdminAuth"

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Laptop },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { session, invalidate } = useAdminAuth()

  const handleLogout = async () => {
    await adminLogout()
    invalidate()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen flex bg-paper-soft">
      <aside className="w-64 shrink-0 bg-ink text-white flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <span className="font-display text-xl font-extrabold tracking-tight">Lapsoo</span>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Admin</span>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors",
                  isActive && "bg-blue-500/15 text-white"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-4 py-2 text-xs text-white/40">
            Signed in as
            <div className="text-white/80 font-medium truncate">{session?.name}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
