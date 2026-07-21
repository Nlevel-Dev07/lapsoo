export const SITE = {
  name: "Lapsoo",
  tagline: "India's Smart Laptop Ecosystem",
  phone: "+91 99112 02101",
  phoneRaw: "919911202101",
  whatsapp: "919911202101",
  email: "info@lapsoo.com",
  corporateEmail: "info@lapsoo.com",
  hours: "Mon – Sun, 10:30 AM – 8:30 PM",
  // Short line used in the Footer and Contact map preview.
  primaryAddress: "M3M Urbana, Golf Course Extension Road, Sector 67, Gurugram, Haryana",
  // Sourced from the Google Maps listings provided. 6 of 7 confirmed — 1 slot still needs an address.
  addresses: [
    {
      city: "M3M Urbana — Dell Exclusive Store",
      line: "R6-001, M3M Urbana, Golf Course Extension Road, Sector 67, Gurugram, Haryana 122102",
    },
    {
      city: "M3M Urbana — ASUS Exclusive Store",
      line: "R4-016, M3M Urbana, Golf Course Extension Road, Sector 67, Gurugram, Haryana 122102",
    },
    {
      city: "M3M Urbana — Lenovo Exclusive Store",
      line: "M3M Urbana Premium, R2-002, Sector 67, Gurugram, Haryana 122101",
    },
    {
      city: "M3M Urbana — Acer Mall Exclusive Store",
      line: "Gate No. 2, R2-0018, M3M Urbana Premium, Behind KFC, Ramgarh, Sector 67, Gurugram, Haryana 122101",
    },
    {
      city: "MG Road — Dell Exclusive Store",
      line: "6A, FF, MGF Megacity Mall, MG Road, Sector 28, Gurugram, Haryana 122002",
    },
    {
      city: "Golf Course Road — Acer Mall Exclusive Store",
      line: "A14/4, GF, Golf Course Rd, DLF Phase 1, Gurugram, Haryana 122002",
    },
    {
      city: "New Railway Road — A One Music & Computers (HQ)",
      line: "9-10, Bhargava Palace, New Railway Road, Gurgaon, Haryana 122001",
    }
  ],
}

// TODO: replace "#" with the real Lapsoo social profile URLs.
export const socialLinks = [
  { id: "instagram" as const, label: "Follow Lapsoo on Instagram", href: "#" },
  { id: "facebook" as const, label: "Follow Lapsoo on Facebook", href: "#" },
  { id: "linkedin" as const, label: "Follow Lapsoo on LinkedIn", href: "#" },
  { id: "twitter" as const, label: "Follow Lapsoo on X", href: "#" },
]

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`
}

// Deep-links to an arbitrary customer number (as opposed to waLink, which always targets SITE.whatsapp).
export function waLinkTo(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "")
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`
}

export function telLink() {
  return `tel:+${SITE.phoneRaw}`
}
