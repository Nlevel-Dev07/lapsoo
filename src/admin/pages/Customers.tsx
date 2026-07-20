import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  fetchAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer,
  ApiError,
  type AdminCustomer,
} from "@/lib/api"
import { LeadTable, DeleteButton, fmtDate } from "@/admin/components/LeadTable"
import { PageHeader } from "@/admin/components/PageHeader"
import { StatCard } from "@/admin/components/StatCard"
import { StatusBadge } from "@/admin/components/StatusBadge"
import { Modal } from "@/components/dashboard/Modal"
import { useConfirm } from "@/admin/components/ConfirmDialog"
import { useToast } from "@/admin/components/Toast"

export default function Customers() {
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const toast = useToast()
  const [resetTarget, setResetTarget] = useState<AdminCustomer | null>(null)
  const [editTarget, setEditTarget] = useState<AdminCustomer | null>(null)
  const [adding, setAdding] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ["admin-customers"], queryFn: fetchAdminCustomers })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateAdminCustomer(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
    onError: () => toast.error("Could not update customer."),
  })

  const deleteCustomer = useMutation({
    mutationFn: (id: string) => deleteAdminCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      toast.success("Customer deleted.")
    },
    onError: () => toast.error("Could not delete customer."),
  })

  return (
    <div className="p-8 max-w-6xl">
      <PageHeader
        title="Customers"
        subtitle="Everyone who has created a customer account on the site."
        actions={
          <Button variant="accent" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <div className="mt-6 sm:max-w-xs">
        <StatCard icon={Users} label="Registered Customers" value={data?.length ?? 0} />
      </div>

      <div className="mt-6">
        <LeadTable
          isLoading={isLoading}
          empty={!data?.length}
          columns={["Name", "Email", "Phone", "Signed Up", "Last Login", "Repairs", "Status", ""]}
          rows={data?.map((c) => [
            c.name,
            c.email,
            c.phone || "—",
            fmtDate(c.createdAt),
            c.lastLoginAt ? fmtDate(c.lastLoginAt) : "Never",
            c._count.repairRequests,
            <button onClick={() => toggleActive.mutate({ id: c.id, active: !c.active })}>
              <StatusBadge>{c.active ? "Active" : "Suspended"}</StatusBadge>
            </button>,
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setResetTarget(c)}>
                Reset Password
              </Button>
              <button onClick={() => setEditTarget(c)} className="p-2 rounded-lg hover:bg-ink/5">
                <Pencil className="h-4 w-4 text-ink/50" />
              </button>
              <DeleteButton
                onClick={async () => {
                  const ok = await confirm({ title: `Delete ${c.name}?`, description: "This cannot be undone.", confirmLabel: "Delete", danger: true })
                  if (ok) deleteCustomer.mutate(c.id)
                }}
              />
            </div>,
          ])}
        />
      </div>

      {resetTarget && <ResetPasswordModal customer={resetTarget} onClose={() => setResetTarget(null)} />}
      {editTarget && <EditCustomerModal customer={editTarget} onClose={() => setEditTarget(null)} />}
      {adding && <AddCustomerModal onClose={() => setAdding(false)} />}
    </div>
  )
}

function ResetPasswordModal({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const reset = useMutation({
    mutationFn: () => updateAdminCustomer(customer.id, { newPassword: password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      toast.success("Password reset.")
      onClose()
    },
    onError: () => setError("Could not reset password. Please try again."),
  })

  return (
    <Modal open onClose={onClose} title="Reset Password" maxWidth="max-w-sm">
      <p className="mt-2 text-sm text-ink/55">
        Set a new password for <span className="font-semibold">{customer.name}</span> ({customer.email}). Share it
        with them directly — no email is sent automatically.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
          }
          reset.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <Input
          type="text"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={reset.isPending}>
          {reset.isPending ? "Saving..." : "Save New Password"}
        </Button>
      </form>
    </Modal>
  )
}

function EditCustomerModal({ customer, onClose }: { customer: AdminCustomer; onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [name, setName] = useState(customer.name)
  const [email, setEmail] = useState(customer.email)
  const [phone, setPhone] = useState(customer.phone ?? "")
  const [error, setError] = useState<string | null>(null)

  const update = useMutation({
    mutationFn: () => updateAdminCustomer(customer.id, { name, email, phone }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      toast.success("Customer updated.")
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update customer. Please try again."),
  })

  return (
    <Modal open onClose={onClose} title="Edit Customer" maxWidth="max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          update.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <Label htmlFor="edit-name">Full Name</Label>
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="edit-email">Email</Label>
          <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-phone">Phone</Label>
          <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Modal>
  )
}

function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: () => createAdminCustomer({ name, email, phone, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] })
      toast.success("Customer created.")
      onClose()
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create customer. Please try again."),
  })

  return (
    <Modal open onClose={onClose} title="Add Customer" maxWidth="max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!/^[6-9]\d{9}$/.test(phone)) {
            setError("Enter a valid 10-digit Indian mobile number")
            return
          }
          if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
          }
          create.mutate()
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <Label htmlFor="add-name">Full Name</Label>
          <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="add-email">Email</Label>
          <Input id="add-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="add-phone">Phone</Label>
          <Input id="add-phone" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="add-password">Password</Label>
          <Input id="add-password" type="text" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Customer"}
        </Button>
      </form>
    </Modal>
  )
}
