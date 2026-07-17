import type { Product } from "@/data/products"
import type { BlogPost } from "@/data/blog"

// vercel.json proxies /api/* through to the Railway backend server-side, so the
// browser only ever sees the Vercel origin — keeps auth cookies same-site everywhere.
const BASE = "/api"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      message = body.error ?? message
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ---------- Public: catalog ----------

export function fetchProducts(params?: { ecosystem?: string; category?: string; brand?: string }) {
  const qs = new URLSearchParams()
  if (params?.ecosystem) qs.set("ecosystem", params.ecosystem)
  if (params?.category) qs.set("category", params.category)
  if (params?.brand) qs.set("brand", params.brand)
  const query = qs.toString()
  return request<(Product & { id: string; images: string[]; published: boolean })[]>(`/products${query ? `?${query}` : ""}`)
}

export function fetchProductBySlugList() {
  return fetchProducts()
}

export function fetchProductById(id: string) {
  return request<Product & { id: string; images: string[]; published: boolean }>(`/products/${id}`)
}

/** The [id] route also accepts a slug, so this is just a semantic alias. */
export const fetchProductBySlug = fetchProductById

export function fetchBrands() {
  return request<{ id: string; name: string; logoUrl: string | null; productCount: number }[]>("/brands")
}

export function fetchBlogPosts() {
  return request<(BlogPost & { id: string; published: boolean })[]>("/blog")
}

export function fetchBlogPostById(id: string) {
  return request<BlogPost & { id: string; published: boolean }>(`/blog/${id}`)
}

// ---------- Public: lead forms ----------

export interface EnquiryPayload {
  source: "GENERAL_ENQUIRY" | "PRODUCT_ENQUIRY" | "CALLBACK_REQUEST"
  name: string
  phone: string
  email?: string
  city?: string
  message?: string
  productId?: string
}

export function submitEnquiry(payload: EnquiryPayload) {
  return request<{ id: string }>("/enquiries", { method: "POST", body: JSON.stringify(payload) })
}

export interface CorporateLeadPayload {
  name: string
  phone: string
  email?: string
  city?: string
  company: string
  quantity: "1-10" | "11-50" | "51-200" | "200+"
  gstin?: string
  message?: string
}

export function submitCorporateLead(payload: CorporateLeadPayload) {
  return request<{ id: string }>("/corporate-leads", { method: "POST", body: JSON.stringify(payload) })
}

export interface RepairBookingPayload {
  name: string
  phone: string
  email?: string
  city?: string
  location?: string
  device: string
  serialNumber?: string
  issueType: string
  message?: string
  mediaUrls: string[]
}

export function submitRepairBooking(payload: RepairBookingPayload) {
  return request<{ id: string; trackingCode: string }>("/repair-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function trackRepair(code: string) {
  return request<{ trackingCode: string; status: string; device: string; issueType: string; createdAt: string; updatedAt: string }>(
    `/repair-requests/track?code=${encodeURIComponent(code)}`
  )
}

export interface SellExchangePayload {
  name: string
  phone: string
  email?: string
  city?: string
  brand: string
  age: string
  condition: string
  message?: string
  mediaUrls: string[]
}

export function submitSellExchange(payload: SellExchangePayload) {
  return request<{ id: string }>("/sell-exchange", { method: "POST", body: JSON.stringify(payload) })
}

// ---------- Customer: auth ----------

export interface CustomerSession {
  id: string
  email: string
  name: string
}

export interface CustomerSignupPayload {
  name: string
  email: string
  phone?: string
  password: string
}

export function customerSignup(payload: CustomerSignupPayload) {
  return request<CustomerSession>("/auth/customer-signup", { method: "POST", body: JSON.stringify(payload) })
}

export function customerLogin(email: string, password: string) {
  return request<CustomerSession>("/auth/customer-login", { method: "POST", body: JSON.stringify({ email, password }) })
}

export function customerLogout() {
  return request<{ ok: true }>("/auth/customer-logout", { method: "POST" })
}

export function customerMe() {
  return request<CustomerSession>("/auth/customer-me")
}

// ---------- Admin: auth ----------

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
}

export function adminLogin(email: string, password: string) {
  return request<AdminSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
}

export function adminLogout() {
  return request<{ ok: true }>("/auth/logout", { method: "POST" })
}

export function adminMe() {
  return request<AdminSession>("/auth/me")
}

// ---------- Admin: dashboard ----------

export interface DashboardStats {
  catalog: { productCount: number; publishedProductCount: number; brandCount: number; blogCount: number }
  leads: {
    total: number
    enquiries: number
    corporateLeads: number
    repairRequests: number
    sellExchangeLeads: number
    last30Days: number
  }
  enquiriesBySource: { source: string; count: number }[]
  repairsByStatus: { status: string; count: number }[]
}

export function fetchDashboardStats() {
  return request<DashboardStats>("/dashboard/stats")
}

// ---------- Admin: products CRUD ----------

export interface ProductInput {
  slug: string
  brandName: string
  model: string
  category: string
  condition: string
  ecosystem: string
  priceFrom: number
  processor: string
  ram: string
  storage: string
  display: string
  graphics: string
  battery: string
  warranty: string
  screenSize: number
  availability: string
  highlights: string[]
  published: boolean
  images: string[]
}

export function createProduct(payload: ProductInput) {
  return request("/products", { method: "POST", body: JSON.stringify(payload) })
}

export function updateProduct(id: string, payload: Partial<ProductInput>) {
  return request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
}

export function deleteProduct(id: string) {
  return request<void>(`/products/${id}`, { method: "DELETE" })
}

export interface BulkImportRowResult {
  row: number
  status: "created" | "updated" | "error"
  slug?: string
  error?: string
}

export interface BulkImportResponse {
  created: number
  updated: number
  failed: number
  results: BulkImportRowResult[]
}

export function bulkImportProducts(products: Record<string, unknown>[]) {
  return request<BulkImportResponse>("/products/bulk-import", { method: "POST", body: JSON.stringify({ products }) })
}

// ---------- Admin: blog CRUD ----------

export interface BlogInput {
  slug: string
  title: string
  excerpt: string
  category: string
  content: string[]
  coverImage?: string
  readTime: string
  published: boolean
}

export function createBlogPost(payload: BlogInput) {
  return request("/blog", { method: "POST", body: JSON.stringify(payload) })
}

export function updateBlogPost(id: string, payload: Partial<BlogInput>) {
  return request(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
}

export function deleteBlogPost(id: string) {
  return request<void>(`/blog/${id}`, { method: "DELETE" })
}

// ---------- Admin: leads (list + status update) ----------

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED"
export type RepairStatus = "BOOKED" | "DIAGNOSING" | "IN_PROGRESS" | "WAITING_FOR_PARTS" | "COMPLETED" | "DELIVERED" | "CANCELLED"

export function fetchEnquiries() {
  return request<any[]>("/enquiries")
}
export function updateEnquiryStatus(id: string, status: LeadStatus) {
  return request(`/enquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
}
export function deleteEnquiry(id: string) {
  return request<void>(`/enquiries/${id}`, { method: "DELETE" })
}

export function fetchCorporateLeads() {
  return request<any[]>("/corporate-leads")
}
export function updateCorporateLeadStatus(id: string, status: LeadStatus) {
  return request(`/corporate-leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
}
export function deleteCorporateLead(id: string) {
  return request<void>(`/corporate-leads/${id}`, { method: "DELETE" })
}

export function fetchRepairRequests() {
  return request<any[]>("/repair-requests")
}
export function updateRepairStatus(id: string, status: RepairStatus) {
  return request(`/repair-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
}
export function deleteRepairRequest(id: string) {
  return request<void>(`/repair-requests/${id}`, { method: "DELETE" })
}

export function fetchSellExchangeLeads() {
  return request<any[]>("/sell-exchange")
}
export function updateSellExchangeStatus(id: string, status: LeadStatus) {
  return request(`/sell-exchange/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
}
export function deleteSellExchangeLead(id: string) {
  return request<void>(`/sell-exchange/${id}`, { method: "DELETE" })
}

// ---------- Admin: image upload ----------

export async function uploadImage(file: File): Promise<string> {
  const sig = await request<{ timestamp: number; signature: string; folder: string; apiKey: string; cloudName: string }>(
    "/upload/sign",
    { method: "POST" }
  )

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", sig.apiKey)
  form.append("timestamp", String(sig.timestamp))
  form.append("signature", sig.signature)
  form.append("folder", sig.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) throw new Error("Image upload failed")
  const data = await res.json()
  return data.secure_url as string
}

// ---------- Public: lead media upload ----------

/** Uploads a photo or video attached to a public lead form (repair booking / sell-exchange). */
export async function uploadLeadMedia(file: File, source: "repair" | "sell-exchange"): Promise<string> {
  const sig = await request<{ timestamp: number; signature: string; folder: string; apiKey: string; cloudName: string }>(
    "/upload/lead-media-sign",
    { method: "POST", body: JSON.stringify({ source }) }
  )

  const form = new FormData()
  form.append("file", file)
  form.append("api_key", sig.apiKey)
  form.append("timestamp", String(sig.timestamp))
  form.append("signature", sig.signature)
  form.append("folder", sig.folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) throw new Error("Upload failed")
  const data = await res.json()
  return data.secure_url as string
}

export { ApiError }
