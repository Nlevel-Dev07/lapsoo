import { useEffect, useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Phone, ChevronDown, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SITE, telLink } from "@/data/site"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { customerLogout } from "@/lib/api"

const nav = [
  {
    label: "LaptopBazaar",
    to: "/laptopbazaar",
    desc: "Brand New Laptops",
    badge: "New",
    badgeColor: "bg-blue-500",
    children: [
      { label: "Business Laptops", to: "/laptopbazaar?category=Business" },
      { label: "Gaming Laptops", to: "/laptopbazaar?category=Gaming" },
      { label: "MacBooks", to: "/laptopbazaar?category=MacBook" },
      { label: "Workstations", to: "/laptopbazaar?category=Workstation" },
      { label: "Corporate Procurement", to: "/corporate" },
    ],
  },
  {
    label: "LapAndTop",
    to: "/lapandtop",
    desc: "Certified Refurbished",
    badge: "Refurbished",
    badgeColor: "bg-emerald-500",
    children: [
      { label: "Business Laptops", to: "/lapandtop?category=Business" },
      { label: "Student Laptops", to: "/lapandtop?category=Student" },
      { label: "Gaming Laptops", to: "/lapandtop?category=Gaming" },
      { label: "Workstations", to: "/lapandtop?category=Workstation" },
      { label: "MacBooks", to: "/lapandtop?category=MacBook" },
      { label: "Sell / Exchange", to: "/sell-exchange" },
    ],
  },
  {
    label: "LapTech",
    to: "/laptech",
    desc: "Repair & Upgrades",
    badge: "Repair",
    badgeColor: "bg-amber-500",
  },
  { label: "Corporate", to: "/corporate" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { session, isLoading, isAuthenticated, invalidate } = useCustomerAuth()

  const handleLogout = async () => {
    await customerLogout()
    invalidate()
    setOpen(false)
    navigate("/")
  }

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      navigate("/")
      window.scrollTo({ top: 0 })
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "bg-white/85 backdrop-blur-xl border-b border-ink/8" : "bg-transparent"
      )}
    >
      <div className="container-lap flex h-20 items-center justify-between">
        <Link to="/" onClick={goHome} className="flex items-center gap-2 shrink-0">
          <img src="/images/lapsoo-logo-light.png" alt="Lapsoo" className="h-8 w-auto" />
        </Link>

        <nav className="hidden xl:flex items-center gap-1">
          {nav.map((item, i) => (
            <div key={item.label} className="relative group">
              {"badge" in item && item.badge && (
                <motion.span
                  initial={{ scale: 0, opacity: 0, y: 6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.15, rotate: -4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.3 + i * 0.12 }}
                  className={cn(
                    "pointer-events-none absolute -top-2 -right-2.5 z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md",
                    item.badgeColor
                  )}
                >
                  <motion.span
                    className="block"
                    animate={{ scale: [1, 1.18, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut", delay: 1 + i * 0.12 }}
                  >
                    {item.badge}
                  </motion.span>
                </motion.span>
              )}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1 px-4 py-2 rounded-full text-[14px] font-semibold text-ink/70 hover:text-ink hover:bg-ink/[0.04] transition-colors",
                    isActive && "text-ink"
                  )
                }
              >
                {item.label}
                {"children" in item && item.children && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
              </NavLink>
              {"children" in item && item.children && (
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200">
                  <div className="w-64 rounded-2xl border border-ink/8 bg-white shadow-xl p-2">
                    {item.children.map((c) => (
                      <Link
                        key={c.label}
                        to={c.to}
                        className="block px-4 py-2.5 rounded-xl text-[14px] font-medium text-ink/70 hover:bg-ink/[0.04] hover:text-ink transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3">
          <motion.a
            href={telLink()}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-2 text-[14px] font-semibold text-ink/70 hover:text-ink transition-colors"
          >
            <Phone className="h-4 w-4" /> {SITE.phone}
          </motion.a>
          {!isLoading && (
            isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[14px] font-semibold text-ink/70 hover:text-ink hover:bg-ink/[0.04] transition-all duration-200">
                  <User className="h-4 w-4" />
                  {session?.name.split(" ")[0]}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform duration-300 group-hover:rotate-180" />
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 ease-out">
                  <div className="w-44 rounded-2xl border border-ink/8 bg-white shadow-xl p-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium text-ink/70 transition-all duration-200 hover:bg-ink/[0.04] hover:text-ink"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Button size="sm">Login</Button>
                </motion.div>
              </Link>
            )
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="xl:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="xl:hidden overflow-hidden border-t border-ink/8 bg-white"
          >
            <div className="container-lap py-4 flex flex-col gap-1">
              {nav.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-[15px] font-semibold text-ink/80 hover:bg-ink/[0.04]"
                  >
                    {item.label}
                    {"badge" in item && item.badge && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white", item.badgeColor)}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
              <div className="flex gap-3 mt-3">
                <a href={telLink()} className="flex-1">
                  <Button variant="outline" className="w-full transition-transform duration-200 active:scale-95">Call Now</Button>
                </a>
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="flex-1">
                    <Button className="w-full transition-transform duration-200 active:scale-95">Logout</Button>
                  </button>
                ) : (
                  <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button className="w-full transition-transform duration-200 active:scale-95">Login</Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
