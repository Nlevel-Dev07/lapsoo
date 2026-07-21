import type { Product } from "@/data/products"
import type { BlogPost } from "@/data/blog"

// vercel.json proxies /api/* through to the Railway backend server-side, so the
// browser only ever sees the Vercel origin — keeps auth cookies same-site everywhere.
const BASE = "/api"

class ApiError extends Error {
  status: number
  body?: Record<string, unknown>
  constructor(message: string, status: number, body?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.body = body
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
    let body: Record<string, unknown> | undefined
    try {
      body = await res.json()
      message = (body?.error as string) ?? message
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status, body)
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
  deviceCategory: string
  deviceCategoryOther?: string
  brand: string
  brandOther?: string
  condition: string
  device: string
  serialNumber: string
  password?: string
  accessories: string[]
  accessoriesOther?: string
  issueType: string
  issueTypeOther?: string
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

export interface Jobsheet {
  trackingCode: string
  name: string
  phone: string
  email: string | null
  city: string | null
  location: string | null
  deviceCategory: string | null
  deviceCategoryOther: string | null
  brand: string | null
  brandOther: string | null
  condition: string | null
  device: string
  serialNumber: string | null
  accessories: string[]
  accessoriesOther: string | null
  issueType: string
  issueTypeOther: string | null
  message: string | null
  mediaUrls: string[]
  estimateCost: number | null
  estimateTime: string | null
  status: string
  store: string | null
  createdAt: string
}

export function fetchJobsheet(code: string) {
  return request<Jobsheet>(`/repair-requests/jobsheet?code=${encodeURIComponent(code)}`)
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
  phone: string
  password: string
  turnstileToken: string
}

export interface CustomerSignupResult {
  id: string
  email: string
  name: string
  requiresVerification: true
}

export function customerSignup(payload: CustomerSignupPayload) {
  return request<CustomerSignupResult>("/auth/customer-signup", { method: "POST", body: JSON.stringify(payload) })
}

export function customerLogin(email: string, password: string, captchaToken: string, captchaAnswer: number) {
  return request<CustomerSession>("/auth/customer-login", {
    method: "POST",
    body: JSON.stringify({ email, password, captchaToken, captchaAnswer }),
  })
}

export interface LoginCaptcha {
  token: string
  question: string
}

export function fetchLoginCaptcha() {
  return request<LoginCaptcha>("/auth/customer-captcha")
}

export function verifyCustomerEmail(email: string, code: string) {
  return request<CustomerSession>("/auth/customer-verify-email", { method: "POST", body: JSON.stringify({ email, code }) })
}

export function resendCustomerVerification(email: string) {
  return request<{ ok: true }>("/auth/customer-resend-code", { method: "POST", body: JSON.stringify({ email }) })
}

export function requestPasswordReset(email: string) {
  return request<{ ok: true }>("/auth/customer-forgot-password", { method: "POST", body: JSON.stringify({ email }) })
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return request<CustomerSession>("/auth/customer-reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  })
}

export function customerLogout() {
  return request<{ ok: true }>("/auth/customer-logout", { method: "POST" })
}

export function customerMe() {
  return request<CustomerSession>("/auth/customer-me")
}

export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
}

export function fetchCustomerProfile() {
  return request<CustomerProfile>("/auth/customer-profile")
}

export function updateCustomerProfile(payload: { name: string; phone?: string }) {
  return request<CustomerProfile>("/auth/customer-profile", { method: "PATCH", body: JSON.stringify(payload) })
}

export function changeCustomerPassword(payload: { currentPassword: string; newPassword: string }) {
  return request<{ ok: true }>("/auth/customer-change-password", { method: "POST", body: JSON.stringify(payload) })
}

export function deleteCustomerAccount(password: string) {
  return request<{ ok: true }>("/auth/customer-delete-account", { method: "DELETE", body: JSON.stringify({ password }) })
}

export interface MyRepairRequest {
  id: string
  trackingCode: string
  status: RepairStatus
  device: string
  issueType: string
  message: string | null
  createdAt: string
  updatedAt: string
}

export function fetchMyRepairRequests() {
  return request<MyRepairRequest[]>("/repair-requests/mine")
}

// ---------- Admin: auth ----------

export interface AdminSession {
  id: string
  email: string
  name: string
  role: string
  type: "admin" | "team"
  menuKeys: string[] | null
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
  customers: { total: number; last30Days: number }
  enquiriesBySource: { source: string; count: number }[]
  repairsByStatus: { status: string; count: number }[]
  leadsTrend: { date: string; count: number }[]
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
export function updateRepairRequest(
  id: string,
  payload: Partial<{ status: RepairStatus; estimateCost: number | null; estimateTime: string | null; assignedToId: string | null }>
) {
  return request(`/repair-requests/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
}
export function deleteRepairRequest(id: string) {
  return request<void>(`/repair-requests/${id}`, { method: "DELETE" })
}

export interface JobsheetPayload extends RepairBookingPayload {
  store: string
}

export function createJobsheet(payload: JobsheetPayload) {
  return request<{ id: string; trackingCode: string }>("/admin/jobsheets", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export type SellExchangeType = "SELL" | "EXCHANGE"

export function fetchSellExchangeLeads(params?: { type?: SellExchangeType }) {
  const qs = new URLSearchParams()
  if (params?.type) qs.set("type", params.type)
  const query = qs.toString()
  return request<any[]>(`/sell-exchange${query ? `?${query}` : ""}`)
}
export function updateSellExchangeStatus(id: string, status: LeadStatus) {
  return request(`/sell-exchange/${id}`, { method: "PATCH", body: JSON.stringify({ status }) })
}
export function deleteSellExchangeLead(id: string) {
  return request<void>(`/sell-exchange/${id}`, { method: "DELETE" })
}

// ---------- Admin: customers ----------

export interface AdminCustomer {
  id: string
  name: string
  email: string
  phone: string | null
  active: boolean
  lastLoginAt: string | null
  createdAt: string
  _count: { repairRequests: number }
}

export function fetchAdminCustomers() {
  return request<AdminCustomer[]>("/admin/customers")
}

export function createAdminCustomer(payload: { name: string; email: string; phone: string; password: string }) {
  return request<AdminCustomer>("/admin/customers", { method: "POST", body: JSON.stringify(payload) })
}

export function updateAdminCustomer(
  id: string,
  payload: Partial<{ name: string; email: string; phone: string; active: boolean; newPassword: string }>
) {
  return request<AdminCustomer>(`/admin/customers/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
}

export function deleteAdminCustomer(id: string) {
  return request<void>(`/admin/customers/${id}`, { method: "DELETE" })
}

// ---------- Admin: roles ----------

export interface Role {
  id: string
  name: string
  menuKeys: string[]
  createdAt: string
  updatedAt: string
  _count?: { teamMembers: number }
}

export function fetchRoles() {
  return request<Role[]>("/admin/roles")
}
export function createRole(payload: { name: string; menuKeys: string[] }) {
  return request<Role>("/admin/roles", { method: "POST", body: JSON.stringify(payload) })
}
export function updateRole(id: string, payload: Partial<{ name: string; menuKeys: string[] }>) {
  return request<Role>(`/admin/roles/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
}
export function deleteRole(id: string) {
  return request<void>(`/admin/roles/${id}`, { method: "DELETE" })
}

// ---------- Admin: team ----------

export interface TeamMember {
  id: string
  name: string
  email: string | null
  phone: string | null
  designation: string | null
  store: string | null
  active: boolean
  lastLoginAt: string | null
  createdAt: string
  role: { id: string; name: string; menuKeys: string[] } | null
}

export function fetchTeamMembers() {
  return request<TeamMember[]>("/admin/team")
}
export function createTeamMember(payload: {
  name: string
  email: string
  phone?: string
  designation?: string
  store?: string
  roleId?: string | null
  password: string
}) {
  return request<TeamMember>("/admin/team", { method: "POST", body: JSON.stringify(payload) })
}
export function updateTeamMember(
  id: string,
  payload: Partial<{
    name: string
    email: string
    phone: string
    designation: string
    store: string
    roleId: string | null
    active: boolean
    newPassword: string
  }>
) {
  return request<TeamMember>(`/admin/team/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
}
export function deleteTeamMember(id: string) {
  return request<void>(`/admin/team/${id}`, { method: "DELETE" })
}
export function fetchDesignations() {
  return request<string[]>("/admin/team/designations")
}

// ---------- Admin: settings ----------

export function changeAdminPassword(payload: { currentPassword: string; newPassword: string }) {
  return request<{ ok: true }>("/admin/change-password", { method: "POST", body: JSON.stringify(payload) })
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
