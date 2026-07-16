import { useEffect, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Phone, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SITE, telLink } from "@/data/site"

const nav = [
  {
    label: "LapAndTop",
    to: "/lapandtop",
    desc: "Certified Refurbished",
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
    label: "LaptopBazaar",
    to: "/laptopbazaar",
    desc: "Brand New Laptops",
    children: [
      { label: "Business Laptops", to: "/laptopbazaar?category=Business" },
      { label: "Gaming Laptops", to: "/laptopbazaar?category=Gaming" },
      { label: "MacBooks", to: "/laptopbazaar?category=MacBook" },
      { label: "Workstations", to: "/laptopbazaar?category=Workstation" },
      { label: "Corporate Procurement", to: "/corporate" },
    ],
  },
  {
    label: "LapTech",
    to: "/laptech",
    desc: "Repair & Upgrades",
  },
  { label: "Corporate", to: "/corporate" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/images/lapsoo-logo-light.png" alt="Lapsoo" className="h-8 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => (
            <div key={item.label} className="relative group">
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
                {item.children && <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
              </NavLink>
              {item.children && (
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

        <div className="hidden lg:flex items-center gap-3">
          <a href={telLink()} className="flex items-center gap-2 text-[14px] font-semibold text-ink/70 hover:text-ink transition-colors">
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <Link to="/contact">
            <Button size="sm">Get Quote</Button>
          </Link>
        </div>

        <button
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-ink/8 bg-white"
          >
            <div className="container-lap py-4 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-xl text-[15px] font-semibold text-ink/80 hover:bg-ink/[0.04]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 mt-3">
                <a href={telLink()} className="flex-1">
                  <Button variant="outline" className="w-full">Call Now</Button>
                </a>
                <Link to="/contact" className="flex-1">
                  <Button className="w-full">Get Quote</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
