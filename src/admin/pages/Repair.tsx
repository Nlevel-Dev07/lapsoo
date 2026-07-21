import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X, LocateFixed, Eye, EyeOff, FileText, Search } from "lucide-react"
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { SITE, waLinkTo } from "@/data/site"
import { MediaUploadField, emptyMediaSlots, type MediaSlots } from "@/components/shared/MediaUploadField"
import {
  fetchRepairRequests, updateRepairRequest, deleteRepairRequest,
  fetchTeamMembers, createJobsheet, ApiError,
  type RepairStatus,
} from "@/lib/api"
import { LeadTable, StatusSelect, DeleteButton, ContactCell, fmtDate } from "@/admin/components/LeadTable"
import { PageHeader } from "@/admin/components/PageHeader"
import { StatusBadge } from "@/admin/components/StatusBadge"
import { Drawer } from "@/admin/components/Drawer"
import { useConfirm } from "@/admin/components/ConfirmDialog"
import { useToast } from "@/admin/components/Toast"
import { useAdminAuth, useRequireMenu } from "@/admin/useAdminAuth"

const repairStatuses: RepairStatus[] = ["BOOKED", "DIAGNOSING", "IN_PROGRESS", "WAITING_FOR_PARTS", "COMPLETED", "DELIVERED", "CANCELLED"]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jobsheetWhatsAppLink(r: any) {
  const jobsheetUrl = `${window.location.origin}/jobsheet/${r.trackingCode}`
  const message = [
    `Hi ${r.name}, here's your Lapsoo repair jobsheet (${r.trackingCode}).`,
    `Device: ${r.device}`,
    `Issue: ${r.issueType === "Other" ? r.issueTypeOther || "Other" : r.issueType}`,
    `Status: ${r.status.replace(/_/g, " ")}`,
    `Estimate Cost: ${r.estimateCost != null ? `₹${r.estimateCost}` : "TBD"}`,
    `Estimate Time: ${r.estimateTime ?? "TBD"}`,
    `View full details: ${jobsheetUrl}`,
    `You can track your status here: ${jobsheetUrl}`,
  ].join("\n")
  return waLinkTo(r.phone, message)
}

export default function Repair() {
  useRequireMenu("repair")
  const [newRepairOpen, setNewRepairOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "ALL">("ALL")
  const [storeFilter, setStoreFilter] = useState<string>("ALL")
  const [typeFilter, setTypeFilter] = useState<"ALL" | "WALK_IN" | "ONLINE">("ALL")
  const [assignedToFilter, setAssignedToFilter] = useState<string>("ALL")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const confirm = useConfirm()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-repair"], queryFn: fetchRepairRequests })
  const { data: team } = useQuery({ queryKey: ["admin-team"], queryFn: fetchTeamMembers })
  const detailTarget = data?.find((r) => r.id === detailId) ?? null

  const storeOptions = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.store).filter(Boolean))) as string[],
    [data]
  )

  const visibleRows = useMemo(() => {
    let rows = data ?? []
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (r) =>
          r.trackingCode.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q) ||
          r.device.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "ALL") rows = rows.filter((r) => r.status === statusFilter)
    if (storeFilter !== "ALL") rows = rows.filter((r) => r.store === storeFilter)
    if (typeFilter !== "ALL") rows = rows.filter((r) => r.type === typeFilter)
    if (assignedToFilter !== "ALL") {
      rows =
        assignedToFilter === "UNASSIGNED"
          ? rows.filter((r) => !r.assignedToId)
          : rows.filter((r) => r.assignedToId === assignedToFilter)
    }
    if (dateFrom) rows = rows.filter((r) => new Date(r.createdAt) >= new Date(dateFrom))
    if (dateTo) rows = rows.filter((r) => new Date(r.createdAt) <= new Date(`${dateTo}T23:59:59`))
    rows = [...rows].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? -diff : diff
    })
    return rows
  }, [data, search, statusFilter, storeFilter, typeFilter, assignedToFilter, dateFrom, dateTo, sortOrder])

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateRepairRequest>[1] }) => updateRepairRequest(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-repair"] }),
    onError: () => toast.error("Could not update repair request."),
  })
  const remove = useMutation({
    mutationFn: deleteRepairRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-repair"] })
      toast.success("Repair request deleted.")
    },
    onError: () => toast.error("Could not delete repair request."),
  })

  const activeTeam = team?.filter((t) => t.active) ?? []

  return (
    <div className="p-8 max-w-7xl">
      <PageHeader
        title="Repair"
        subtitle="All repair bookings submitted across the site."
        actions={
          <Button variant="outline" size="sm" onClick={() => setNewRepairOpen(true)}>
            New Repair
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking ID, customer, device..."
            className="h-9 w-64 pl-8 text-xs"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RepairStatus | "ALL")} className="h-9 w-auto text-xs">
          <option value="ALL">All Statuses</option>
          {repairStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </Select>
        <Select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="h-9 w-auto text-xs">
          <option value="ALL">All Stores</option>
          {storeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "ALL" | "WALK_IN" | "ONLINE")} className="h-9 w-auto text-xs">
          <option value="ALL">All Types</option>
          <option value="WALK_IN">Walk-in</option>
          <option value="ONLINE">Online</option>
        </Select>
        <Select value={assignedToFilter} onChange={(e) => setAssignedToFilter(e.target.value)} className="h-9 w-auto text-xs">
          <option value="ALL">All Assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {activeTeam.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-auto text-xs" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-auto text-xs" />
        <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")} className="h-9 w-auto text-xs">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </Select>
      </div>

      <div className="mt-3">
        <LeadTable
          isLoading={isLoading}
          empty={!visibleRows.length}
          columns={["Tracking ID", "Customer", "Device", "Type", "Assigned To", "Date", "Status", ""]}
          rows={visibleRows.map((r) => [
            <span className="font-mono text-xs font-semibold">{r.trackingCode}</span>,
            <ContactCell phone={r.phone} email={r.email} name={r.name} />,
            <div className="max-w-[180px] truncate" title={r.device}>{r.device}</div>,
            <StatusBadge tone={r.type === "WALK_IN" ? "warning" : "blue"}>{r.type === "WALK_IN" ? "Walk-in" : "Online"}</StatusBadge>,
            r.assignedTo?.name ?? <span className="text-ink/35">Unassigned</span>,
            fmtDate(r.createdAt),
            <StatusSelect
              value={r.status}
              onChange={(status) => update.mutate({ id: r.id, payload: { status } })}
              options={repairStatuses}
            />,
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setDetailId(r.id)}
                title="View details"
                className="p-2 rounded-lg hover:bg-ink/5"
              >
                <Eye className="h-4 w-4 text-ink/50" />
              </button>
              <a
                href={jobsheetWhatsAppLink(r)}
                target="_blank"
                rel="noreferrer"
                title="Send jobsheet via WhatsApp"
                className="p-2 rounded-lg hover:bg-green-50"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
              </a>
              <DeleteButton
                onClick={async () => {
                  const ok = await confirm({ title: "Delete this repair request?", confirmLabel: "Delete", danger: true })
                  if (ok) remove.mutate(r.id)
                }}
              />
            </div>,
          ])}
        />
      </div>

      {detailTarget && (
        <RepairDetailDrawer
          repair={detailTarget}
          activeTeam={activeTeam}
          onClose={() => setDetailId(null)}
          onUpdate={(payload) => update.mutate({ id: detailTarget.id, payload })}
        />
      )}

      {newRepairOpen && <NewRepairModal onClose={() => setNewRepairOpen(false)} />}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
      <div className="mt-0.5 text-sm text-ink/80">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/8 p-5">
      <h4 className="font-display text-sm font-bold">{title}</h4>
      <div className="mt-3 grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function RepairDetailDrawer({
  repair,
  activeTeam,
  onClose,
  onUpdate,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repair: any
  activeTeam: { id: string; name: string }[]
  onClose: () => void
  onUpdate: (payload: Parameters<typeof updateRepairRequest>[1]) => void
}) {
  const r = repair
  const accessories = (r.accessories as string[]) ?? []
  const mediaUrls = (r.mediaUrls as string[])?.filter(Boolean) ?? []

  return (
    <Drawer open onClose={onClose} title={r.name} subtitle={`Tracking ID: ${r.trackingCode}`} maxWidth="max-w-2xl">
      <div className="space-y-5">
        <Section title="Customer">
          <Field label="Name">{r.name}</Field>
          <Field label="Phone">{r.phone}</Field>
          <Field label="Email">{r.email || "—"}</Field>
          <Field label="City">{r.city || "—"}</Field>
          <Field label="Location">{r.location || "—"}</Field>
        </Section>

        <Section title="Device">
          <Field label="Category">{r.deviceCategory === "Other" ? `Other — ${r.deviceCategoryOther || "—"}` : r.deviceCategory || "—"}</Field>
          <Field label="Brand">{r.brand === "Other" ? `Other — ${r.brandOther || "—"}` : r.brand || "—"}</Field>
          <Field label="Condition">{r.condition || "—"}</Field>
          <Field label="Device">{r.device}</Field>
          <Field label="Serial Number">{r.serialNumber || "—"}</Field>
          <Field label="Accessories">
            {accessories.length
              ? accessories.map((a) => (a === "Other" ? `Other — ${r.accessoriesOther || "—"}` : a)).join(", ")
              : "—"}
          </Field>
          <Field label="Issue Type">{r.issueType === "Other" ? `Other — ${r.issueTypeOther || "—"}` : r.issueType}</Field>
        </Section>

        {r.message && (
          <Section title="Message">
            <div className="sm:col-span-2 text-sm text-ink/70">{r.message}</div>
          </Section>
        )}

        {mediaUrls.length > 0 && (
          <div className="rounded-2xl border border-ink/8 p-5">
            <h4 className="font-display text-sm font-bold">Media</h4>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {mediaUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-16 items-center justify-center rounded-xl bg-paper-soft text-xs font-medium text-blue-600 hover:bg-blue-50"
                >
                  View {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        <Section title="Booking">
          <Field label="Date">{fmtDate(r.createdAt)}</Field>
          <Field label="Type"><StatusBadge tone={r.type === "WALK_IN" ? "warning" : "blue"}>{r.type === "WALK_IN" ? "Walk-in" : "Online"}</StatusBadge></Field>
          <Field label="Store">{r.store || "—"}</Field>
          <Field label="Created By">{r.createdByName || "—"}</Field>
        </Section>

        <div className="rounded-2xl border border-ink/8 p-5">
          <h4 className="font-display text-sm font-bold">Repair Management</h4>
          <div className="mt-3 grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Estimate Cost</Label>
              <EstimateCostInput value={r.estimateCost} onSave={(estimateCost) => onUpdate({ estimateCost })} />
            </div>
            <div>
              <Label>Estimate Time</Label>
              <EstimateTimeInput value={r.estimateTime} onSave={(estimateTime) => onUpdate({ estimateTime })} />
            </div>
            <div>
              <Label>Assign To</Label>
              <Select
                value={r.assignedToId ?? ""}
                onChange={(e) => onUpdate({ assignedToId: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {activeTeam.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
                {r.assignedTo && !activeTeam.some((t) => t.id === r.assignedTo!.id) && (
                  <option value={r.assignedTo.id}>{r.assignedTo.name} (inactive)</option>
                )}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={r.status} onChange={(e) => onUpdate({ status: e.target.value as RepairStatus })}>
                {repairStatuses.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a href={jobsheetWhatsAppLink(r)} target="_blank" rel="noreferrer">
            <Button type="button" variant="whatsapp" className="w-full">
              <WhatsAppIcon className="h-4 w-4" /> Send via WhatsApp
            </Button>
          </a>
          <a href={`/jobsheet/${r.trackingCode}`} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline" className="w-full">
              <FileText className="h-4 w-4" /> View / Print Jobsheet
            </Button>
          </a>
        </div>
      </div>
    </Drawer>
  )
}

function EstimateCostInput({ value, onSave }: { value: number | null; onSave: (v: number | null) => void }) {
  const [draft, setDraft] = useState(value != null ? String(value) : "")

  return (
    <Input
      type="number"
      min={0}
      placeholder="₹ Cost"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = draft.trim() === "" ? null : Number(draft)
        if (parsed !== value) onSave(parsed)
      }}
    />
  )
}

function EstimateTimeInput({ value, onSave }: { value: string | null; onSave: (v: string | null) => void }) {
  const [draft, setDraft] = useState(value ?? "")

  return (
    <Input
      type="text"
      placeholder="e.g. 2-3 days"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = draft.trim() === "" ? null : draft.trim()
        if (parsed !== value) onSave(parsed)
      }}
    />
  )
}

const STORE_OPTIONS = [...SITE.addresses.map((a) => a.city), "Lapsoo"]

function NewRepairModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { session } = useAdminAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [location, setLocation] = useState("")
  const [locating, setLocating] = useState(false)
  const [deviceCategory, setDeviceCategory] = useState("")
  const [deviceCategoryOther, setDeviceCategoryOther] = useState("")
  const [brand, setBrand] = useState("")
  const [brandOther, setBrandOther] = useState("")
  const [condition, setCondition] = useState("")
  const [device, setDevice] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [issueType, setIssueType] = useState("")
  const [issueTypeOther, setIssueTypeOther] = useState("")
  const [message, setMessage] = useState("")
  const [accessories, setAccessories] = useState<string[]>([])
  const [accessoriesOther, setAccessoriesOther] = useState("")
  const [store, setStore] = useState("")
  const [mediaSlots, setMediaSlots] = useState<MediaSlots>(emptyMediaSlots)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const toggleAccessory = (option: string) => {
    setAccessories((prev) => (prev.includes(option) ? prev.filter((a) => a !== option) : [...prev, option]))
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const create = useMutation({
    mutationFn: () =>
      createJobsheet({
        name,
        phone,
        email: email || undefined,
        city: "Gurgaon",
        location,
        deviceCategory,
        deviceCategoryOther: deviceCategoryOther || undefined,
        brand,
        brandOther: brandOther || undefined,
        condition,
        device,
        serialNumber,
        password: password || undefined,
        accessories,
        accessoriesOther: accessoriesOther || undefined,
        issueType,
        issueTypeOther: issueTypeOther || undefined,
        message: message || undefined,
        mediaUrls: [mediaSlots.front, mediaSlots.back, mediaSlots.open, mediaSlots.video],
        store,
      }),
    onSuccess: (res) => {
      setResult(res.trackingCode)
      queryClient.invalidateQueries({ queryKey: ["admin-repair"] })
      toast.success("Jobsheet created.")
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create jobsheet. Please try again."),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">New Repair — Walk-in Jobsheet</h3>
            <p className="mt-1 text-xs text-ink/50">
              For customers walking into a store. Online bookings from the Book Repair form on the site are tagged{" "}
              <span className="font-semibold">Online</span> automatically; jobsheets created here are tagged{" "}
              <span className="font-semibold">Walk-in</span>.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink/5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {result ? (
          <div className="mt-6 text-center py-6">
            <p className="font-display text-lg font-bold">Jobsheet created.</p>
            <p className="mt-2 text-sm text-ink/55">Tracking ID</p>
            <p className="font-mono text-2xl font-bold mt-1">{result}</p>
            <Button className="mt-6" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              if (!location.trim()) return setError("Location is required")
              if (!store) return setError("Select a store")
              if (!serialNumber.trim()) return setError("Serial number is required")
              if (deviceCategory === "Other" && !deviceCategoryOther.trim()) return setError("Please specify the device category")
              if (brand === "Other" && !brandOther.trim()) return setError("Please specify the brand")
              if (issueType === "Other" && !issueTypeOther.trim()) return setError("Please specify the issue")
              if (accessories.includes("Other") && !accessoriesOther.trim()) return setError("Please specify the accessory")
              if (!mediaSlots.front || !mediaSlots.back || !mediaSlots.open || !mediaSlots.video) return setError("All four photos/video are required")
              create.mutate()
            }}
            className="mt-4 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>City</Label>
                <Input readOnly value="Gurgaon" />
              </div>
            </div>

            <div>
              <Label>Exact / Current Location *</Label>
              <div className="flex gap-2">
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={locating}>
                  <LocateFixed className="h-4 w-4" /> {locating ? "Locating..." : "Use Current"}
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Store *</Label>
                <Select value={store} onChange={(e) => setStore(e.target.value)} required>
                  <option value="">Select store</option>
                  {STORE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Input readOnly value="Walk-in" />
              </div>
              <div>
                <Label>Jobsheet Created By</Label>
                <Input readOnly value={session?.name ?? ""} />
              </div>
              <div>
                <Label>Device Category *</Label>
                <Select value={deviceCategory} onChange={(e) => setDeviceCategory(e.target.value)} required>
                  <option value="" disabled>Select device category</option>
                  {["Laptop", "Monitor", "All in One", "Desktop", "Printer", "Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
                {deviceCategory === "Other" && (
                  <Input
                    className="mt-2"
                    placeholder="Please specify the device category"
                    value={deviceCategoryOther}
                    onChange={(e) => setDeviceCategoryOther(e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label>Brand *</Label>
                <Select value={brand} onChange={(e) => setBrand(e.target.value)} required>
                  <option value="" disabled>Select brand</option>
                  {["Dell", "Lenovo", "ASUS", "Acer", "Apple", "HP", "Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
                {brand === "Other" && (
                  <Input
                    className="mt-2"
                    placeholder="Please specify the brand"
                    value={brandOther}
                    onChange={(e) => setBrandOther(e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label>Condition *</Label>
                <Select value={condition} onChange={(e) => setCondition(e.target.value)} required>
                  <option value="" disabled>Select condition</option>
                  {["Like New", "Medium", "Scratched"].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label>Device Brand & Model *</Label>
                <Input value={device} onChange={(e) => setDevice(e.target.value)} required />
              </div>
              <div>
                <Label>Serial Number *</Label>
                <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
              </div>
              <div>
                <Label>Issue Type *</Label>
                <Select value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
                  <option value="" disabled>Select issue type</option>
                  {["Screen", "Battery", "Keyboard", "SSD/RAM Upgrade", "Motherboard", "Data Recovery", "Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
                {issueType === "Other" && (
                  <Input
                    className="mt-2"
                    placeholder="Please specify the issue"
                    value={issueTypeOther}
                    onChange={(e) => setIssueTypeOther(e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label>Device Password (if any)</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="pr-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 transition-colors hover:text-ink/60"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Label>Accessories Handed Over</Label>
              <div className="flex flex-wrap gap-4 mt-1.5">
                {["Adaptor", "Powercord", "Other"].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-sm text-ink/70">
                    <input type="checkbox" className="h-4 w-4" checked={accessories.includes(option)} onChange={() => toggleAccessory(option)} />
                    {option}
                  </label>
                ))}
              </div>
              {accessories.includes("Other") && (
                <Input
                  className="mt-2"
                  placeholder="Please specify the accessory"
                  value={accessoriesOther}
                  onChange={(e) => setAccessoriesOther(e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <MediaUploadField source="repair" value={mediaSlots} onChange={setMediaSlots} />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create Jobsheet"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
