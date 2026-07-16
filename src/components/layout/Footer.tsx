import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"
import { SITE, telLink, socialLinks } from "@/data/site"
import { SocialIconRow } from "@/components/shared/SocialIcon"

const columns = [
  {
    title: "LapAndTop",
    links: [
      { label: "Business Laptops", to: "/lapandtop?category=Business" },
      { label: "Student Laptops", to: "/lapandtop?category=Student" },
      { label: "Gaming Laptops", to: "/lapandtop?category=Gaming" },
      { label: "MacBooks", to: "/lapandtop?category=MacBook" },
      { label: "Sell / Exchange", to: "/sell-exchange" },
    ],
  },
  {
    title: "LaptopBazaar",
    links: [
      { label: "New Laptops", to: "/laptopbazaar" },
      { label: "Corporate Procurement", to: "/corporate" },
      { label: "Bulk Orders", to: "/corporate" },
      { label: "Student Offers", to: "/laptopbazaar?category=Student" },
    ],
  },
  {
    title: "LapTech",
    links: [
      { label: "Screen Replacement", to: "/laptech#services" },
      { label: "SSD / RAM Upgrade", to: "/laptech#services" },
      { label: "Data Recovery", to: "/laptech#services" },
      { label: "Book Repair", to: "/laptech#book" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Corporate Solutions", to: "/corporate" },
      { label: "Blog", to: "/blog" },
      { label: "Contact", to: "/contact" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#091739] text-white">
      <div className="container-lap py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2">
          <img src="/images/lapsoo-logo-dark.png" alt="Lapsoo" className="h-8 w-auto" />
          <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-xs">
            India's Smart Laptop Ecosystem — new laptops, certified refurbished devices, and expert repair, all under one trusted roof.
          </p>
          <div className="mt-5 space-y-2 text-sm text-white/70">
            <a href={telLink()} className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="h-4 w-4" /> {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="h-4 w-4" /> {SITE.email}
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {SITE.primaryAddress}
            </div>
          </div>
          <div className="mt-5">
            <SocialIconRow links={socialLinks} />
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-lap py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Lapsoo. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-white/70">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white/70">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white/70">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
