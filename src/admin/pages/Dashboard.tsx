import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Laptop, Tag, Newspaper, TrendingUp, Users } from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts"
import { fetchDashboardStats } from "@/lib/api"
import { useAdminAuth } from "@/admin/useAdminAuth"
import { PageHeader } from "@/admin/components/PageHeader"
import { StatCard } from "@/admin/components/StatCard"

// Validated categorical order (dataviz skill reference palette) — fixed order, never cycled.
const CATEGORICAL = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834", "#4a3aa7", "#e34948"]

const sourceLabels: Record<string, string> = {
  GENERAL_ENQUIRY: "General Enquiry",
  PRODUCT_ENQUIRY: "Product Enquiry",
  CALLBACK_REQUEST: "Callback Request",
}

const statusLabels: Record<string, string> = {
  BOOKED: "Booked",
  DIAGNOSING: "Diagnosing",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_PARTS: "Waiting for Parts",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-ink/8 bg-white p-6"
    >
      <h3 className="font-display font-bold">{title}</h3>
      {subtitle && <p className="text-xs text-ink/40 mt-0.5">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </motion.div>
  )
}

function ChartSkeleton() {
  return <div className="h-64 animate-pulse rounded-xl bg-paper-soft" />
}

export default function Dashboard() {
  const { session } = useAdminAuth()
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats })

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        title={`${greeting()}, ${session?.name?.split(" ")[0] ?? ""}`}
        subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />

      {isLoading || !data ? (
        <div className="mt-8 space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-white border border-ink/8" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={Laptop} label="Published Products" value={data.catalog.publishedProductCount} sub={`${data.catalog.productCount} total`} />
            <StatCard icon={Tag} label="Brands" value={data.catalog.brandCount} />
            <StatCard icon={Newspaper} label="Blog Posts" value={data.catalog.blogCount} />
            <StatCard icon={TrendingUp} label="Leads (30 days)" value={data.leads.last30Days} accent />
            <StatCard icon={Users} label="Registered Customers" value={data.customers.total} sub={`${data.customers.last30Days} new in 30 days`} />
          </div>

          <div className="mt-6">
            <ChartCard title="Leads over the last 14 days" subtitle="All enquiries, corporate, repair, and sell/exchange submissions">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.leadsTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f5eff" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#2f5eff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e6e7eb" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    tick={{ fontSize: 11, fill: "#8a8b93" }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8a8b93" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e6e7eb", fontSize: 13 }}
                    labelFormatter={(d) => new Date(String(d)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  />
                  <Area type="monotone" dataKey="count" name="Leads" stroke="#2f5eff" strokeWidth={2} fill="url(#leadsGradient)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="mt-5 grid lg:grid-cols-2 gap-5">
            <ChartCard title="Repair Requests by Status">
              {data.repairsByStatus.length === 0 ? (
                <p className="text-sm text-ink/40">No repair requests yet.</p>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.repairsByStatus}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        cornerRadius={4}
                        strokeWidth={2}
                        stroke="#ffffff"
                      >
                        {data.repairsByStatus.map((_, i) => (
                          <Cell key={i} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e6e7eb", fontSize: 13 }}
                        formatter={(value, _name, entry) => {
                          const status = (entry as { payload?: { status?: string } })?.payload?.status
                          return [value, status ? (statusLabels[status] ?? status) : ""]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2 min-w-0">
                    {data.repairsByStatus.map((r, i) => (
                      <div key={r.status} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 text-ink/60 min-w-0">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CATEGORICAL[i % CATEGORICAL.length] }} />
                          <span className="truncate">{statusLabels[r.status] ?? r.status}</span>
                        </span>
                        <span className="font-semibold shrink-0">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Enquiries by Source">
              {data.enquiriesBySource.length === 0 ? (
                <p className="text-sm text-ink/40">No enquiries yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={data.enquiriesBySource.map((e) => ({ ...e, label: sourceLabels[e.source] ?? e.source }))}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="0" horizontal={false} stroke="#e6e7eb" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#8a8b93" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#0a0a0c" }} axisLine={false} tickLine={false} width={130} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e7eb", fontSize: 13 }} cursor={{ fill: "#f6f7f9" }} />
                    <Bar dataKey="count" name="Enquiries" fill="#2a78d6" radius={[0, 4, 4, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <div className="mt-5">
            <ChartCard title="Leads by Type">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { label: "Enquiries", count: data.leads.enquiries },
                    { label: "Corporate", count: data.leads.corporateLeads },
                    { label: "Repair", count: data.leads.repairRequests },
                    { label: "Sell / Exchange", count: data.leads.sellExchangeLeads },
                  ]}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#e6e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#0a0a0c" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8a8b93" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e7eb", fontSize: 13 }} cursor={{ fill: "#f6f7f9" }} />
                  <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {["Enquiries", "Corporate", "Repair", "Sell / Exchange"].map((_, i) => (
                      <Cell key={i} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
