import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchEnquiries, updateEnquiryStatus, deleteEnquiry,
  fetchCorporateLeads, updateCorporateLeadStatus, deleteCorporateLead,
  type LeadStatus,
} from "@/lib/api"
import { LeadTable, ContactCell, StatusSelect, DeleteButton, fmtDate } from "@/admin/components/LeadTable"

const tabs = [
  { key: "enquiries", label: "Enquiries" },
  { key: "corporate", label: "Corporate" },
] as const

type TabKey = typeof tabs[number]["key"]

const leadStatuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"]

export default function Leads() {
  const [tab, setTab] = useState<TabKey>("enquiries")

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-2xl font-bold">Leads</h1>
      <p className="mt-1 text-sm text-ink/50">General enquiries and corporate leads submitted across the site.</p>

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
