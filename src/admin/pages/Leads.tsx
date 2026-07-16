import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { Select } from "@/components/ui/select"
import {
  fetchEnquiries, updateEnquiryStatus, deleteEnquiry,
  fetchCorporateLeads, updateCorporateLeadStatus, deleteCorporateLead,
  fetchRepairRequests, updateRepairStatus, deleteRepairRequest,
  fetchSellExchangeLeads, updateSellExchangeStatus, deleteSellExchangeLead,
  type LeadStatus, type RepairStatus,
} from "@/lib/api"

const tabs = [
  { key: "enquiries", label: "Enquiries" },
  { key: "corporate", label: "Corporate" },
  { key: "repair", label: "Repair" },
  { key: "sell-exchange", label: "Sell / Exchange" },
] as const

type TabKey = typeof tabs[number]["key"]

const leadStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]
const repairStatuses: RepairStatus[] = ["BOOKED", "DIAGNOSING", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED", "DELIVERED", "CANCELLED"]

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function Leads() {
  const [tab, setTab] = useState<TabKey>("enquiries")

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Leads</h1>
      <p className="mt-1 text-sm text-ink/50">All enquiries and bookings submitted across the site.</p>

      <div className="mt-6 flex gap-1 rounded-full bg-white border border-ink/8 p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-ink text-white" : "text-ink/50 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "enquiries" && <EnquiriesTable />}
        {tab === "corporate" && <CorporateTable />}
        {tab === "repair" && <RepairTable />}
        {tab === "sell-exchange" && <SellExchangeTable />}
      </div>
    </div>
  )
}

function EnquiriesTable() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-enquiries"], queryFn: fetchEnquiries })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateEnquiryStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] }),
  })
  const remove = useMutation({
    mutationFn: deleteEnquiry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-enquiries"] }),
  })

  return (
    <LeadTable
      isLoading={isLoading}
      empty={!data?.length}
      columns={["Name", "Contact", "Source", "Product", "Date", "Status", ""]}
      rows={data?.map((e) => [
        e.name,
        <ContactCell phone={e.phone} email={e.email} />,
        <span className="text-xs text-ink/50">{e.source.replace(/_/g, " ")}</span>,
        e.product?.model ?? "—",
        fmtDate(e.createdAt),
        <StatusSelect value={e.status} onChange={(status) => updateStatus.mutate({ id: e.id, status })} options={leadStatuses} />,
        <DeleteButton onClick={() => confirm("Delete this enquiry?") && remove.mutate(e.id)} />,
      ])}
    />
  )
}

function CorporateTable() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-corporate"], queryFn: fetchCorporateLeads })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateCorporateLeadStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-corporate"] }),
  })
  const remove = useMutation({
    mutationFn: deleteCorporateLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-corporate"] }),
  })

  return (
    <LeadTable
      isLoading={isLoading}
      empty={!data?.length}
      columns={["Company", "Contact", "Quantity", "GSTIN", "Date", "Status", ""]}
      rows={data?.map((l) => [
        <div><div className="font-semibold">{l.company}</div><div className="text-xs text-ink/40">{l.name}</div></div>,
        <ContactCell phone={l.phone} email={l.email} />,
        l.quantity,
        l.gstin || "—",
        fmtDate(l.createdAt),
        <StatusSelect value={l.status} onChange={(status) => updateStatus.mutate({ id: l.id, status })} options={leadStatuses} />,
        <DeleteButton onClick={() => confirm("Delete this lead?") && remove.mutate(l.id)} />,
      ])}
    />
  )
}

function RepairTable() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-repair"], queryFn: fetchRepairRequests })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RepairStatus }) => updateRepairStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-repair"] }),
  })
  const remove = useMutation({
    mutationFn: deleteRepairRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-repair"] }),
  })

  return (
    <LeadTable
      isLoading={isLoading}
      empty={!data?.length}
      columns={["Tracking ID", "Contact", "Device", "Issue", "Date", "Status", ""]}
      rows={data?.map((r) => [
        <span className="font-mono text-xs font-semibold">{r.trackingCode}</span>,
        <ContactCell phone={r.phone} email={r.email} name={r.name} />,
        r.device,
        r.issueType,
        fmtDate(r.createdAt),
        <StatusSelect value={r.status} onChange={(status) => updateStatus.mutate({ id: r.id, status })} options={repairStatuses} />,
        <DeleteButton onClick={() => confirm("Delete this repair request?") && remove.mutate(r.id)} />,
      ])}
    />
  )
}

function SellExchangeTable() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-sell-exchange"], queryFn: fetchSellExchangeLeads })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => updateSellExchangeStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sell-exchange"] }),
  })
  const remove = useMutation({
    mutationFn: deleteSellExchangeLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sell-exchange"] }),
  })

  return (
    <LeadTable
      isLoading={isLoading}
      empty={!data?.length}
      columns={["Contact", "Laptop", "Age", "Condition", "Date", "Status", ""]}
      rows={data?.map((s) => [
        <ContactCell phone={s.phone} email={s.email} name={s.name} />,
        s.brand,
        s.age,
        s.condition,
        fmtDate(s.createdAt),
        <StatusSelect value={s.status} onChange={(status) => updateStatus.mutate({ id: s.id, status })} options={leadStatuses} />,
        <DeleteButton onClick={() => confirm("Delete this lead?") && remove.mutate(s.id)} />,
      ])}
    />
  )
}

function LeadTable({
  columns,
  rows,
  isLoading,
  empty,
}: {
  columns: string[]
  rows?: React.ReactNode[][]
  isLoading: boolean
  empty: boolean
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-paper-soft text-left text-xs font-semibold uppercase tracking-wide text-ink/45">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-5 py-3 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/6">
          {isLoading && (
            <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-ink/40">Loading…</td></tr>
          )}
          {!isLoading && empty && (
            <tr><td colSpan={columns.length} className="px-5 py-8 text-center text-ink/40">No records yet.</td></tr>
          )}
          {rows?.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-5 py-3 align-middle whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ContactCell({ phone, email, name }: { phone: string; email?: string | null; name?: string }) {
  return (
    <div>
      {name && <div className="font-semibold">{name}</div>}
      <div>{phone}</div>
      {email && <div className="text-xs text-ink/40">{email}</div>}
    </div>
  )
}

function StatusSelect<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: T[] }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value as T)} className="h-9 text-xs min-w-[140px]">
      {options.map((o) => (
        <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
      ))}
    </Select>
  )
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-2 rounded-lg hover:bg-red-50">
      <Trash2 className="h-4 w-4 text-red-500" />
    </button>
  )
}
