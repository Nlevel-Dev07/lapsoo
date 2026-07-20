import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { X, Mail, LocateFixed, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { SITE } from "@/data/site"
import { MediaUploadField, emptyMediaSlots, type MediaSlots } from "@/components/shared/MediaUploadField"
import {
  fetchRepairRequests, updateRepairRequest, deleteRepairRequest, emailRepairJobsheet,
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

export default function Repair() {
  useRequireMenu("repair")
  const [newRepairOpen, setNewRepairOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const confirm = useConfirm()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["admin-repair"], queryFn: fetchRepairRequests })
  const { data: team } = useQuery({ queryKey: ["admin-team"], queryFn: fetchTeamMembers })
  const detailTarget = data?.find((r) => r.id === detailId) ?? null

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
  const emailJobsheet = useMutation({
    mutationFn: emailRepairJobsheet,
    onSuccess: () => toast.success("Jobsheet emailed."),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not send email."),
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

      <div className="mt-6">
        <LeadTable
          isLoading={isLoading}
          empty={!data?.length}
          columns={["Tracking ID", "Customer", "Device", "Type", "Assigned To", "Date", "Status", ""]}
          rows={data?.map((r) => [
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
              <button
                onClick={() => emailJobsheet.mutate(r.id)}
                disabled={!r.email || emailJobsheet.isPending}
                title={r.email ? "Email jobsheet to customer" : "No email on file"}
                className="p-2 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Mail className="h-4 w-4 text-blue-500" />
              </button>
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
          onEmailJobsheet={() => emailJobsheet.mutate(detailTarget.id)}
          emailPending={emailJobsheet.isPending}
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
  onEmailJobsheet,
  emailPending,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repair: any
  activeTeam: { id: string; name: string }[]
  onClose: () => void
  onUpdate: (payload: Parameters<typeof updateRepairRequest>[1]) => void
  onEmailJobsheet: () => void
  emailPending: boolean
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
          <Field label="Category">{r.deviceCategory || "—"}</Field>
          <Field label="Brand">{r.brand || "—"}</Field>
          <Field label="Condition">{r.condition || "—"}</Field>
          <Field label="Device">{r.device}</Field>
          <Field label="Serial Number">{r.serialNumber || "—"}</Field>
          <Field label="Accessories">{accessories.length ? accessories.join(", ") : "—"}</Field>
          <Field label="Issue Type">{r.issueType}</Field>
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

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onEmailJobsheet}
          disabled={!r.email || emailPending}
        >
          <Mail className="h-4 w-4" /> {r.email ? "Email Jobsheet to Customer" : "No email on file"}
        </Button>
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
  const [brand, setBrand] = useState("")
  const [condition, setCondition] = useState("")
  const [device, setDevice] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [password, setPassword] = useState("")
  const [issueType, setIssueType] = useState("")
  const [message, setMessage] = useState("")
  const [accessories, setAccessories] = useState<string[]>([])
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
        brand,
        condition,
        device,
        serialNumber: serialNumber || undefined,
        password: password || undefined,
        accessories,
        issueType,
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
              </div>
              <div>
                <Label>Brand *</Label>
                <Select value={brand} onChange={(e) => setBrand(e.target.value)} required>
                  <option value="" disabled>Select brand</option>
                  {["Dell", "Lenovo", "ASUS", "Acer", "Apple", "HP", "Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
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
                <Label>Serial Number</Label>
                <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
              <div>
                <Label>Issue Type *</Label>
                <Select value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
                  <option value="" disabled>Select issue type</option>
                  {["Screen", "Battery", "Keyboard", "SSD/RAM Upgrade", "Motherboard", "Data Recovery", "Other"].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              </div>
              <div>
                <Label>Device Password (if any)</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
