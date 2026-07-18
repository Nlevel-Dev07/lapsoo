import { useQuery } from "@tanstack/react-query"
import { Laptop, Tag, Newspaper, Inbox, Building2, Wrench, RefreshCw, TrendingUp, Users } from "lucide-react"
import { fetchDashboardStats } from "@/lib/api"

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

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats })

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/50">Overview of your catalog and lead activity.</p>

      {isLoading || !data ? (
        <div className="mt-10 text-ink/40 text-sm">Loading stats…</div>
      ) : (
        <>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Laptop} label="Published Products" value={data.catalog.publishedProductCount} sub={`${data.catalog.productCount} total`} />
            <StatCard icon={Tag} label="Brands" value={data.catalog.brandCount} />
            <StatCard icon={Newspaper} label="Blog Posts" value={data.catalog.blogCount} />
            <StatCard icon={TrendingUp} label="Leads (30 days)" value={data.leads.last30Days} accent />
            <StatCard icon={Users} label="Registered Customers" value={data.customers.total} sub={`${data.customers.last30Days} new in 30 days`} />
          </div>

          <div className="mt-10 grid lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-ink/8 bg-white p-6">
              <h3 className="font-display font-bold">Leads by Type</h3>
              <div className="mt-5 space-y-3">
                <LeadRow icon={Inbox} label="General & Product Enquiries" value={data.leads.enquiries} />
                <LeadRow icon={Building2} label="Corporate Leads" value={data.leads.corporateLeads} />
                <LeadRow icon={Wrench} label="Repair Requests" value={data.leads.repairRequests} />
                <LeadRow icon={RefreshCw} label="Sell / Exchange" value={data.leads.sellExchangeLeads} />
              </div>
            </div>

            <div className="rounded-2xl border border-ink/8 bg-white p-6">
              <h3 className="font-display font-bold">Enquiries by Source</h3>
              <div className="mt-5 space-y-3">
                {data.enquiriesBySource.length === 0 && <p className="text-sm text-ink/40">No enquiries yet.</p>}
                {data.enquiriesBySource.map((e) => (
                  <div key={e.source} className="flex items-center justify-between text-sm">
                    <span className="text-ink/60">{sourceLabels[e.source] ?? e.source}</span>
                    <span className="font-semibold">{e.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-ink/8 bg-white p-6 lg:col-span-2">
              <h3 className="font-display font-bold">Repair Requests by Status</h3>
              <div className="mt-5 grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.repairsByStatus.length === 0 && <p className="text-sm text-ink/40">No repair requests yet.</p>}
                {data.repairsByStatus.map((r) => (
                  <div key={r.status} className="rounded-xl bg-paper-soft p-4">
                    <p className="text-xs font-semibold text-ink/45 uppercase tracking-wide">{statusLabels[r.status] ?? r.status}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{r.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent }: { icon: typeof Laptop; label: string; value: number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "border-blue-200 bg-blue-50" : "border-ink/8 bg-white"}`}>
      <Icon className={`h-5 w-5 ${accent ? "text-blue-600" : "text-ink/40"}`} />
      <p className="mt-4 font-display text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-ink/50">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-ink/35">{sub}</p>}
    </div>
  )
}

function LeadRow({ icon: Icon, label, value }: { icon: typeof Laptop; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2.5 text-ink/60">
        <Icon className="h-4 w-4 text-ink/35" /> {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
