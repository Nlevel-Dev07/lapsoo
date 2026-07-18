import { products } from "@/data/products"
import { productGradient } from "@/lib/gradient"
import type { DashboardOrder } from "@/components/dashboard/types"

function findProduct(slug: string) {
  const p = products.find((x) => x.slug === slug)
  if (!p) throw new Error(`Unknown mock product slug: ${slug}`)
  return p
}

function gradientFor(slug: string) {
  const p = findProduct(slug)
  return p.gradientFrom && p.gradientTo ? { from: p.gradientFrom, to: p.gradientTo } : productGradient(slug)
}

export const mockOrders: DashboardOrder[] = [
  {
    id: "ord-1",
    orderNumber: "LPS-88213",
    productSlug: "apple-macbook-air-m3-new",
    brand: "Apple",
    model: 'MacBook Air M3',
    price: 114900,
    orderedAt: "2026-07-02",
    status: "Delivered",
    gradientFrom: gradientFor("apple-macbook-air-m3-new").from,
    gradientTo: gradientFor("apple-macbook-air-m3-new").to,
    trackingSteps: [
      { label: "Order Confirmed", date: "2026-07-02", done: true },
      { label: "Packed", date: "2026-07-03", done: true },
      { label: "Out for Delivery", date: "2026-07-05", done: true },
      { label: "Delivered", date: "2026-07-05", done: true },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "LPS-88547",
    productSlug: "dell-xps-13-new",
    brand: "Dell",
    model: "XPS 13 Plus",
    price: 129999,
    orderedAt: "2026-07-14",
    status: "Out for Delivery",
    eta: "2026-07-19",
    gradientFrom: gradientFor("dell-xps-13-new").from,
    gradientTo: gradientFor("dell-xps-13-new").to,
    trackingSteps: [
      { label: "Order Confirmed", date: "2026-07-14", done: true },
      { label: "Packed", date: "2026-07-15", done: true },
      { label: "Out for Delivery", date: "2026-07-18", done: true },
      { label: "Delivered", date: "2026-07-19", done: false },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "LPS-87960",
    productSlug: "lenovo-thinkpad-x1-carbon-g9-refurb",
    brand: "Lenovo",
    model: "ThinkPad X1 Carbon Gen 9",
    price: 44999,
    orderedAt: "2026-06-20",
    status: "Processing",
    eta: "2026-07-24",
    gradientFrom: gradientFor("lenovo-thinkpad-x1-carbon-g9-refurb").from,
    gradientTo: gradientFor("lenovo-thinkpad-x1-carbon-g9-refurb").to,
    trackingSteps: [
      { label: "Order Confirmed", date: "2026-06-20", done: true },
      { label: "Packed", date: "2026-07-20", done: false },
      { label: "Out for Delivery", date: "", done: false },
      { label: "Delivered", date: "", done: false },
    ],
  },
]

export const mockRecentlyViewedSlugs = [
  "asus-zenbook-14-oled-new",
  "lenovo-legion-5-pro-new",
  "hp-pavilion-15-new",
  "acer-predator-helios-neo-new",
]
