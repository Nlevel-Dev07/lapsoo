import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import {
  fetchRepairRequests, updateRepairRequest, deleteRepairRequest,
  fetchTechnicians, createTechnician, updateTechnician,
  type RepairStatus, type Technician,
} from "@/lib/api"
import { LeadTable, StatusSelect, DeleteButton, fmtDate } from "@/admin/components/LeadTable"

const repairStatuses: RepairStatus[] = ["BOOKED", "DIAGNOSING", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED", "DELIVERED", "CANCELLED"]

export default function Repair() {
  const [manageOpen, setManageOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-repair"], queryFn: fetchRepairRequests })
  const { data: technicians } = useQuery({ queryKey: ["admin-technicians"], queryFn: fetchTechnicians })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateRepairRequest>[1] }) => updateRepairRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-repair"] }),
  })
  const remove = useMutation({
    mutationFn: deleteRepairRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-repair"] }),
  })

  const activeTechnicians = technicians?.filter((t) => t.active) ?? []

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Repair</h1>
          <p className="mt-1 text-sm text-ink/50">All repair bookings submitted across the site.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setManageOpen(true)}>
          Manage Technicians
        </Button>
      </div>

      <div className="mt-6">
        <LeadTable
          isLoading={isLoading}
          empty={!data?.length}
          columns={[
            "Tracking ID", "Name", "Phone", "Email", "City", "Location",
            "Device Category", "Brand", "Condition", "Device", "Serial Number",
            "Accessories", "Issue Type", "Message", "Media", "Date",
            "Status", "Estimate", "Assign To", "",
          ]}
          rows={data?.map((r) => [
            <span className="font-mono text-xs font-semibold">{r.trackingCode}</span>,
            r.name,
            r.phone,
            r.email || "—",
            r.city || "—",
            <span className="block max-w-[160px] truncate" title={r.location || ""}>{r.location || "—"}</span>,
            r.deviceCategory || "—",
            r.brand || "—",
            r.condition || "—",
            r.device,
            r.serialNumber || "—",
            (r.accessories as string[])?.length ? (r.accessories as string[]).join(", ") : "—",
            r.issueType,
            <span className="block max-w-[200px] truncate" title={r.message || ""}>{r.message || "—"}</span>,
            (r.mediaUrls as string[])?.length ? (
              <a
                href={(r.mediaUrls as string[])[0]}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault()
                  ;(r.mediaUrls as string[]).forEach((url) => window.open(url, "_blank"))
                }}
              >
                View ({(r.mediaUrls as string[]).length})
              </a>
            ) : "—",
            fmtDate(r.createdAt),
            <StatusSelect
              value={r.status}
              onChange={(status) => update.mutate({ id: r.id, payload: { status } })}
              options={repairStatuses}
            />,
            <EstimateInput
              value={r.estimateAmount}
              onSave={(estimateAmount) => update.mutate({ id: r.id, payload: { estimateAmount } })}
            />,
            <Select
              value={r.technicianId ?? ""}
              onChange={(e) => update.mutate({ id: r.id, payload: { technicianId: e.target.value || null } })}
              className="h-9 text-xs min-w-[140px]"
            >
              <option value="">Unassigned</option>
              {activeTechnicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              {r.technician && !activeTechnicians.some((t) => t.id === r.technician.id) && (
                <option value={r.technician.id}>{r.technician.name} (inactive)</option>
              )}
            </Select>,
            <DeleteButton onClick={() => confirm("Delete this repair request?") && remove.mutate(r.id)} />,
          ])}
        />
      </div>

      {manageOpen && <TechnicianModal technicians={technicians ?? []} onClose={() => setManageOpen(false)} />}
    </div>
  )
}

function EstimateInput({ value, onSave }: { value: number | null; onSave: (v: number | null) => void }) {
  const [draft, setDraft] = useState(value != null ? String(value) : "")

  return (
    <Input
      type="number"
      min={0}
      placeholder="₹ Estimate"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = draft.trim() === "" ? null : Number(draft)
        if (parsed !== value) onSave(parsed)
      }}
      className="h-9 text-xs w-28 px-3"
    />
  )
}

function TechnicianModal({ technicians, onClose }: { technicians: Technician[]; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const create = useMutation({
    mutationFn: () => createTechnician({ name, phone: phone || undefined }),
    onSuccess: () => {
      setName("")
      setPhone("")
      queryClient.invalidateQueries({ queryKey: ["admin-technicians"] })
    },
  })
  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateTechnician(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-technicians"] }),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Manage Technicians</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-2 max-h-64 overflow-y-auto">
          {technicians.length === 0 && <p className="text-sm text-ink/40">No technicians yet.</p>}
          {technicians.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-ink/8 px-4 py-2.5">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                {t.phone && <p className="text-xs text-ink/40">{t.phone}</p>}
              </div>
              <button
                onClick={() => toggleActive.mutate({ id: t.id, active: !t.active })}
                className={`text-xs font-semibold px-3 py-1 rounded-full ${t.active ? "bg-emerald-50 text-emerald-700" : "bg-ink/5 text-ink/40"}`}
              >
                {t.active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim()) create.mutate()
          }}
          className="mt-5 flex gap-2 pt-4 border-t border-ink/8"
        >
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
          <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
          <Button type="submit" size="sm" disabled={create.isPending || !name.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
